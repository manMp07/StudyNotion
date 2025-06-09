const Tag = require("../models/Tag");

exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body;

        if(!name || description === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required"
            });
        }

        const newTag = Tag.create({
            name,
            description
        });

        console.log("New tag created:", newTag);
        
        res.status(201).json({ 
            success: true,
            message: "Tag created successfully",
        });
    }
    catch (error) {
        console.error("Error while creating tag:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}

exports.showAllTags = async (req, res) => {
    try {
        const allTags = await Tag.findAll({}, {name : true, description: true});

        res.status(200).json({ 
            success: true, 
            message: "All Tags fetched successfully",
            allTags: allTags
        });

    } catch (error) {
        console.error("Error while fetching tags:", error);
        res.status(500).json({ 
            success: false,
            message: error.message
        });
    }
}