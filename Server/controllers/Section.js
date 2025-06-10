const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async (req, res) => {
    //datafetch
    //data validation
    //create section
    //update course schema
    try {
        const {sectionName, courseId} = req.body;

        if(!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Section name and course ID are required"
            });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const newSection = await Section.create({ sectionName });

        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $push: { courseContent: newSection._id }
        }, { new: true }).populate('courseContent');
        // now how to populate the courseContent field with the subsections?

        console.log("New section created:", newSection);
        res.status(200).json({ 
            success: true,
            message: "Section created successfully",
            updatedCourse
        });
    }
    catch (error) {
        console.error("Error while creating section:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}

exports.updateSection = async (req, res) => {

    try {
        const  { sectionId, sectionName } = req.body;

        if (!sectionId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: "Section ID and section name are required"
            });
        }

        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new: true }
        );

        return res.status(200).json({ 
            success: true,
            message: "Section updated successfully",
            updatedSection
        });
    }
    catch (error) {
        console.error("Error while updating section:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}

exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.params;

        if( !sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Section ID and course ID are required"
            });
        }

        const deleteSection = await Section.findByIdAndDelete(sectionId);

        // TODO[Testing]: do we need to delete the section from the course schema as well??
        /* const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $pull: { courseContent: sectionId }
        }, { new: true }); */

        console.log("Section deleted:", deleteSection);

        res.status(200).json({ 
            success: true,
            message: "Section deleted successfully"
        });
    }
    catch (error) {
        console.error("Error while deleting section:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}