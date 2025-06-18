const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
    try {
        const {name, description} = req.body;

        if(!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required."
            });
        }

        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category: categoryDetails
        });
    }
    catch(error) {
        console.error("Error while creating category:", error);
        return res.status(500).json({
            success: false,
            message: "Error while creating category.",
            error: error.message
        });
    }
}

exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, {
            name: true,
            description: true,
        });

        res.status(200).json({
            success: true,
            message: "All categories fetched successfully.",
            data: allCategories
        });
    }
    catch(error) {
        console.error("Error while fetching categories:", error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching categories.",
            error: error.message
        });
    }
}

exports.categoryPageDetails = async (req, res) => {
    //get categoryId
    //get courses for given categoryId
    //validation
    //get courses for different categories
    //get top selling courses
    //return response

    try {
        const {categoryId} = req.body;
        const selectedCategory = await Category.findById(categoryId)
                                    .populate("courses").exec();

        if(!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        const differentCategories = await Category.find({ _id: { $ne: categoryId } })
                                                .populate("courses").exec();

        //HW - topselling courses
        //Top 10
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                }
            })
            .exec();
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses.sort((a, b) => b.sold - a.sold).slice(0, 10)
    
        return res.status(200).json({
            success: true,
            message: "Category page details fetched successfully.",
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses
            }
        });
    }
    catch(error) {
        console.error("Error while fetching category page details:", error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching category page details.",
            error: error.message
        });
    }
}