const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth, about, contactNumber, gender } = req.body;
        const userId = req.user.id;

        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        if (!profileDetails) {
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            });
        }

        if (dateOfBirth !== undefined)  profileDetails.dateOfBirth = dateOfBirth;
        if (about !== undefined)        profileDetails.about = about;
        if (contactNumber !== undefined) profileDetails.contactNumber = contactNumber;
        if (gender !== undefined)       profileDetails.gender = gender;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            profile: profileDetails
        });
    }
    catch (error) {
        console.error('Error while updating profile:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the profile.",
            error: error.message
        });
    }
}

//Explore : CronJob for schedulinng the tasks
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const userDetails = User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const profileId = userDetails.additionalDetail;
        await Profile.findByIdAndDelete(profileId);

        //TODO : unenroll user from all courses

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully."
        });
    }
    catch (error) {
        console.error('Error while deleting account:', error);
        res.status(500).json({
            success: false,
            message: "Error while deleting the account.",
            error: error.message
        });
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const userDetails = await User.findById(userId).populate('additionalDetails').exec();

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully.",
            data: userDetails
        });
    }
    catch (error) {
        console.error('Error while fetching user details:', error);
        res.status(500).json({
            success: false,
            message: "Error while fetching user details.",
            error: error.message
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        console.log(image)
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        return res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    }
    catch (error) {
        return res.status(500).json({
        success: false,
        message: error.message,
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;

        let userDetails = await User.findOne({ _id: userId })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec();

        userDetails = userDetails.toObject();
        let SubsectionLength = 0;

        for (let i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0;
            SubsectionLength = 0;

            for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce(
                    (acc, curr) => acc + parseInt(curr.timeDuration),
                    0
                );

                userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds);
                SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length;
            }

            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            });

            courseProgressCount = courseProgressCount?.completedVideos.length;

            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100;
            } else {
                const multiplier = Math.pow(10, 2);
                userDetails.courses[i].progressPercentage =
                    Math.round((courseProgressCount / SubsectionLength) * 100 * multiplier) / multiplier;
            }
        }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            });
        }

        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id });

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnroled.length;
            const totalAmountGenerated = totalStudentsEnrolled * course.price;

            return {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,
            };
        });

        res.status(200).json({ courses: courseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
