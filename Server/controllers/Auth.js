const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const mailSender = require('../utils/mailSender');
const otpGenerator = require('otp-generator');
const bcrypt = require('brcypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// send otp : It creates new OTP and saves it to the database
exports.sendOtp = async (req, res) => {

    try {
        const {email} = req.body;

        if(!email) 
            return res.status(400).json({message: "Email is required"});

        const checkUserPresent = await User.find({email});

        // if user already exists
        if(checkUserPresent){
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        let otp = otpGenerator.generate(6, {
            upperCase: false,
            specialChars: false
        });
        const result = await OTP.findOne({otp: otp});
        
        while(result){
            otp = otpGenerator.generate(6, {
                upperCase: false,
                specialChars: false
            });

            result = await OTP.findOne({otp: otp});
        }

        console.log("Generated OTP:", otp);

        const otpPayload = {
            email: email,
            otp: otp
        };

        const otpBody = await OTP.create(otpPayload);
        console.log("OTP saved to database:", otpBody);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otpBody
        });
    }
    catch (error) {
        console.error("Error in sendOtp controller:", error);
        return res.status(500).json({
            success: false,
            message: "OTP could not be sent, please try again",
            error: error.message
        });
    }
}

// signup
exports.signup = async (req, res) => {
    try {
        const { 
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;
        
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists" 
            });
        }

        // 2 password should match
        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // find most recent OTP
        const recentOtp = await OTP.find({ email: email }).sort({ createdAt: -1 }).limit(1);
        console.log("Recent OTP:", recentOtp);

        // validate OTP
        if(recentOtp.length === 0 || recentOtp[0].otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=0B0B45`
        });

        console.log("User created successfully:", user);
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    }
    catch (error) {
        console.error("Error in signup controller:", error);
        return res.status(500).json({
            success: false,
            message: "User Cannot be registered, Please try again",
            error: error.message
        });
    }
}

// login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please fill all the details carefully" 
            });
        }

        // find user
        let user = await User.findOne({ email }).lean();
        
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User does not exist" 
            });
        }

        // verify password & generate JWT token
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                role: user.accountType
            }
            const token = jwt.sign( payload, process.env.JWT_SECRET,{
                expiresIn: "2h"
            });
             
            //user = user.toObject();
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                message: "User logged in successfully",
                token,
                user,
            });
        }
        else {
            // incorrect password
            return res.status(403).json({
                success: false,
                message: "Incorrect Password" 
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'User cannot be logged in',
            error: error.message
        });
    }
}

// change password
exports.changePassword = async (req, res) => {
    try{    
        //get data from request body
        // data : oldPassword, newPassword, confirmNewPassword
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // validate data
        if(!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Enter all the fields carefully"
            });
        }

        if(oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password"
            });
        }

        if(newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm new password do not match"
            });
        }

        // get user from database
        const userId = req.user.id;
        if(!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        const user = await User.findById(userId); // can be add .lean() if you want to convert it to plain object

        // check if old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if(!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        //update password in database
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = newHashedPassword;
        await user.save();
        
        // send mail on successful password change
        const mailBody = `
            <h1>Password Changed Successfully</h1>
            <p>Your password has been changed successfully.</p>
            <p>If you did not request this change, please contact support immediately.</p>
        `;
        await mailSender(user.email, "Password Changed Successfully", mailBody);
        
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    }
    catch (error) {
        console.error("Error in changePassword controller:", error);
        return res.status(500).json({
            success: false,
            message: "Password could not be changed, please try again",
            error: error.message
        });
    }
}