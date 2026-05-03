const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true },
  studentName: { type: String, required: true, trim: true },
  course: { type: String, default: "" },
  year: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  roomNumber: { type: String, default: "" },
  block: { type: String, default: "" },
  joinDate: { type: String, default: "" },
  status: { type: String, default: "Active" },
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema);
