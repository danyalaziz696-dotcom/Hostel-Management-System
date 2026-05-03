const mongoose = require("mongoose");
require("dotenv").config();

let cachedConnection = null;
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.gcpabhe.mongodb.net/hms_db";
    cachedConnection = await mongoose.connect(uri);
    console.log("MongoDB Connected");
    return cachedConnection;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

module.exports = connectDB;
