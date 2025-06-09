const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//reset password token
exports.resetPasswordToken = async (req, res) => {
    //get email from request body
    //check user for this email, email velidation
    //generate token
    //update user by adding token and expiry time
    //send email containing url
    //return response

    try {
        const { email } = req.body;
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({
                success: false,
                message: 'Your email is not registered with us' });
        }

        const token = crypto.randomUUID();

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 5*60*1000 // expire in 2 minutes 
        }, { new: true }); // response with updated user

        const url = `http://localhost:3000/reset-password/${token}`;

        await mailSender({
            email: updatedUser.email,
            subject: 'Reset Password Link',
            body: `Reset Password Link: ${url}`
        });

        return res.status(200).json({
            success: true,
            message: "Reset password link sent to your registered email"
        });
    }
    catch (error) {
        console.error('Error generating reset password token:', error);
        res.status(500).json({
            success: false,
            message: 'Error in generating reset password token.'
        });
    }
}

//reset password
exports.resetPassword = async (req, res) => {
    //fetch data : newPassword, confirmPassword, token
    //find user by token
    //check if token is valid and not expired
    //check if newPassword and confirmPassword are same
    //hash new password
    //update user with new password and remove token and expiry time

    try {
        const { newPassword, confirmPassword, token } = req.body;
        // frontend ne tino ko body me dala hai

        if(!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password are required.'
            });
        }

        if(newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match.'
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token
        });

        if(!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid reset password token.'
            });
        }

        if(user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Reset password token has expired.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. Now you can login with your new password.',
        });
    }
    catch (error) {
        console.error('Error in resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Error in resetting password.'
        });
    }
}