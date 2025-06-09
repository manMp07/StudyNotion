const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
    },
}, {timestamps: true});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);