const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({});

const connectDB = ()=> {
    mongoose.connect(process.env.DATABASE_URL).then((connection)=> {
        console.log("== Database connection established ==");
    }).catch(e=> {
        console.log("== Database connection failed: ", e.message, " ==");
    });
}

module.exports = {
    connectDB
}