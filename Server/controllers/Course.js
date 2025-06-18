const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
const { uplaodImageToCloudinary } = require('../utils/imageUploader');

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;
        const thumbnail = req.file.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        //check for tag
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        //upload image to cloudinary
        const thumbnailImage = await uplaodImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //crreate course entry
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        //update user schema
        await User.findByIdAndUpdate(
            {_id : instructorDetails._id},
            { $push: {courses: newCourse._id} },
            { new: true }
        );

        //update tag schema
        await Category.findByIdAndUpdate(
            {_id : category._id},
            { $push: {courses: newCourse._id} },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        });
    }
    catch (error) {
        console.error("Error while creating new course:", error);
        res.status(500).json({
            success: false,
            message: "Error while creating new course",
            error: error.message
        });
    }
}

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        /*const allCourses = await Course.find({}, {
            courseName: true,
            courseDescription: true,
            instructor: true,
            whatYouWillLearn: true,
            ratingAndReviews: true,
            price: true,
            thumbnail: true,
            studentsEnrolled: true
        }).populate("instructor").exec();*/

        const allCourses = await Course.find({});

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses
        });
    }
    catch (error) {
        console.error("Error while fetching all courses:", error);
        res.status(500).json({
            success: false,
            message: "Error while fetching all courses",
            error: error.message
        });
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;

        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                }
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                }
            })
            .exec();

        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Course not found with courseId: ${courseId}`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails
        });
    }
    catch (error) {
        console.error("Error while fetching course details:", error);
        res.status(500).json({
            success: false,
            message: "Error while fetching course details",
            error: error.message
        });
    }
}