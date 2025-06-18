// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
    login,
    signup,
    sendOtp,
    changePassword,
} = require("../controllers/Auth")

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication
// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

router.post("/login", login)// Route for user login
router.post("/signup", signup)// Route for user signup
router.post("/sendotp", sendOtp)// Route for sending OTP to the user's email
router.post("/changePassword", auth, changePassword)// Route for Changing the password


// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************
router.post("/reset-password-token", resetPasswordToken)// Route for generating a reset password token
router.post("/reset-password", resetPassword)// Route for resetting user's password after verification

module.exports = router