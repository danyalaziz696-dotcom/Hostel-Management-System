const mongoose = require("mongoose");
require("dotenv").config();

let cachedConnection = null;
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not configured");
    }

    cachedConnection = await mongoose.connect(uri);
    console.log("MongoDB Connected");
    return cachedConnection;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

module.exports = connectDB;
