const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/videoUploader');

exports.createSubSection = async (req, res) => {
    //data fetch
    //fetch video
    //data validation
    //upload video to cloudinary
    //create subsection
    //update section schema

    try {
        const {title, timeDuration, discription, sectionId} = req.body;
        const video = req.file.videoFile;

        if(!title || !timeDuration || !discription || !sectionId || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const uploadedVideo = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        
        const newSubSection = await SubSection.create({
            title,
            timeDuration,
            discription,
            videoUrl: uploadedVideo.secure_url,
        });

        const updatedSection = await Section.findByIdAndUpdate(sectionId, {
            $push: { subSection: newSubSection._id }
        }, { new: true }).populate('subSection');

        return res.status(200).json({ 
            success: true,
            message: "Subsection created successfully",
            updatedSection
        });
    }
    catch (error) {
        console.error("Error while creating subsection:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}

exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, timeDuration, discription } = req.body;
        const video = req.file.videoFile;

        if (!subSectionId || !title || !timeDuration || !discription) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const updateData = {
            title,
            timeDuration,
            discription
        };

        if (video) {
            const uploadedVideo = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            updateData.videoUrl = uploadedVideo.secure_url;
        }

        const updatedSubSection = await SubSection.findByIdAndUpdate(subSectionId, updateData, { new: true });

        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: "Subsection not found"
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Subsection updated successfully",
            updatedSubSection
        });
    }
    catch (error) {
        console.error("Error while updating subsection:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Subsection ID and section ID are required"
            });
        }

        const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

        if (!deletedSubSection) {
            return res.status(404).json({
                success: false,
                message: "Subsection not found"
            });
        }

        // Do it on testing
        /* const updatedSection = await Section.findByIdAndUpdate(sectionId, {
            $pull: { subSection: subSectionId }
        }, { new: true }).populate('subSection'); */

        res.status(200).json({ 
            success: true,
            message: "Subsection deleted successfully",
            updatedSection
        });
    }
    catch (error) {
        console.error("Error while deleting subsection:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}