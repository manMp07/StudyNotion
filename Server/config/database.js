const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
        console.error('Issue in connecting to MongoDB');
        console.error(err);
        process.exit(1);
    });
}

module.exports = connectDB;