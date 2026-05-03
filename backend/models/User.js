const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  email: String,
  studentId: String,
  status: { type: String, default: "Active" },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
