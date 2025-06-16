const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');

exports.capturePayment = async (req, res) => {
    //get courseId and userId
    //validation courseId and courseDetails
    //is user already enrolled in the course
    //create order
    //return response

    try {
        const {courseId} = req.body;
        const userId = req.user._id;
        
        if(!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        let course = await Course.findById(courseId);
        if(!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const uid = new monogoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(400).json({
                success: false,
                message: "User already enrolled in this course"
            });
        }

        const amount = course.price;
        const currency = "INR";
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: `receipt_${courseId}_${userId}`, // Any Unique receipt ID
            notes: {
                courseId: courseId,
                userId: userId
            }
        };

        const order = await instance.orders.create(options);
        console.log("Order created:", order);

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: order.id,
            currency: order.currency,
            ammount: order.amount / 100,
            message: "Order created successfully"
        });
    }
    catch(error) {
        console.error("Error in capturing payment function:", error);
        return res.status(500).json({
            success: false,
            message: "Error in capturing payment",
            error: error.message
        });
    }
}


exports.verifySignature = async (req, res) => {
    try {
        const webhookSecret = "12345678";

        const signature = req.headers['x-razorpay-signature'];
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if(signature === digest) {
            console.log("Payment is Authorized");

            const {courseId, userId} = req.body.payload.payment.entity.notes; // check this by logging req.body

            const enrolledCourse = await Course.findByIdAndUpdate({_id : courseId}, {
                $push: {studentsEnrolled: userId}
            }, {new: true});

            if(!enrolledCourse) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found in verify payment signature function"
                });
            }

            const enrolledStudent = await User.findByIdAndUpdate({_id : userId}, {
                $push: {courses: courseId}
            }, {new:true});
         
            // send mail for successful payment

            const emailResponse = await mailSender(enrolledStudent.email,
                                    "Congratulations! You have successfully enrolled in the course",
                                    `<h1>Congratulations ${enrolledStudent.name}!</h1>`);

            return res.status(200).json({
                success: true,
                message: "Payment signature verified and course added successfully",
            });
        }
        else{
            console.log("Payment signature is not matched");
            return res.status(400).json({
                success: false,
                message: "Payment signature is not matched"
            });
        }
    }
    catch(error) {
        console.error("Error in verifying signature of payment:", error);
        return res.status(500).json({
            success: false,
            message: "Error in verifying signature of payment",
            error: error.message
        });
    }
}