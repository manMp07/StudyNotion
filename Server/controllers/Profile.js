const Profile = require('../models/Profile');
const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const userId = req.user.id;

        if(!contactNumber || !gender || !userId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const userDetails = User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const profileId = userDetails.additionalDetail;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gendet = gender;

        profileDetails.save();

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
        const userDetails = await User.findById(userId).populate('additionalDetail').exec();

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