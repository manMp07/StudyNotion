const mongoose = require("mongoose");

// HW : Turn this tag model into a Category model

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    }],
    
}, {timestamps: true});

module.exports = mongoose.model("Tag", tagSchema);