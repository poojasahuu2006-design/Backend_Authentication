import mongoose from "mongoose";
import config from './config.js';

// function
async function connectDB() {
    try {
        await mongoose.connect(config.MONGODB_URL);
        console.log("Connected to DB Successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
    }
}

export default connectDB;
