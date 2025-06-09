// auth, isStudent, isAdmin

const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req, res, next) => {
    try {
        const token = req.cookies.token || req.body?.token || req.header("Authorization").replace("Bearer ", "");

        if(!token || token === null || token === undefined) {
            return res.status(401).json({
                success: false,
                message: "Token is Missing"
            });
        }

        // verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
            console.log("Decoded Payload: ", decode);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token"
            });
        }

        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating token",
            error: error.message
        });
    }
}

exports.isStudent = (req, res, next) => {
    try {

        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Students only"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating student role",
            error: error.message
        });
    }
}

exports.isInstructor = (req, res, next) => {
    try {
        if(req.user.role !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Instructor only"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating Instructor role",
        });
    }
}

exports.isAdmin = (req, res, next) => {
    try {
        if(req.user.role !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Admin only"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating Admin role",
            error: error.message
        });
    }
}