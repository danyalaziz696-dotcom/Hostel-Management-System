const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  studentId: { type: String, default: "", trim: true },
  studentName: { type: String, default: "", trim: true },
  roomNumber: { type: String, default: "", trim: true },
  type: { type: String, required: true, trim: true },
  desc: { type: String, required: true },
  date: { type: String, required: true },
  priority: { type: String, default: "Medium" },
  status: { type: String, default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);
