const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("DB Connected Successfully");
    })
    .catch((err) => {
        console.error("DB Connection Failed");
        console.error(err);
        process.exit(1);
    });
}

module.exports = connectDB;