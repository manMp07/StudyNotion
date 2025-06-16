const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');

exports.createRatingAndReview = async (req, res) => {
    //get user id
    //fetch data from request body
    //check if user is enrolled in the course
    //check if user has already rated the course
    //create rating and review
    //update course with this rating/review
    //return response

    try {
        const userId = req.user.id;
        const {rating, review, courseId} = req.body;

        if(!rating || !review) {
            return res.status(400).json({
                success: false,
                message: "Rating and review are required."
            });
        }

        const courseDetails = await Course.findOne({
                                        _id: courseId,
                                        studentsEnrolled: { $elemMatch: {$eq: userId} }
                                    });

        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in this course."
            });
        }

        const existingReview = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if(existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this course."
            });
        }

        const ratingReview = await RatingAndReview.create({
            course: courseId,
            user: userId,
            rating,
            review,
        });

        if(!ratingReview) {
            return res.status(500).json({
                success: false,
                message: "Failed to create rating and review."
            });
        }
        
        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $push: { ratingAndReviews: ratingReview._id },
        }, { new: true });

        console.log("Updated Course after rating/reviews:", updatedCourse);

        return res.status(201).json({
            success: true,
            message: "Rating and review created successfully.",
            data: ratingReview
        });
    }
    catch (error) {
        console.error("Error in creating rating and review:", error);
        res.status(500).json({
            success: false,
            message: "Error while creating rating and review."
        });
    }
}

exports.getAverageRating = async (req, res) => {
    try {
        const {courseId} = req.body;

        const result = await RatingAndReview.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(courseId) } },
            { $group: { _id: null, averageRating: { $avg: "$rating" } } }
        ]);

        if(!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No ratings found for this course.",
                averageRating: 0
            });
        }

        return res.status(200).json({
            success: true,
            message: "Average rating fetched successfully.",
            averageRating: result[0].averageRating
        });
    }
    catch (error) {
        console.error("Error in fetching average rating:", error);
        res.status(500).json({
            success: false,
            message: "Error while fetching average rating."
        });
    }
}

exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find()
            .sort({rating: -1})
            .populate({
                path: "user",
                select: "firstName lastName email image"
            })
            .populate({
                path: "course",
                select: "courseName"
            })
            .exec();

        if(!allReviews || allReviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No ratings and reviews found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ratings and reviews fetched successfully.",
            data: allReviews
        });
    }
    catch (error) {
        console.error("Error in fetching ratings and reviews:", error);
        res.status(500).json({
            success: false,
            message: "Error while fetching ratings and reviews."
        });
    }
}