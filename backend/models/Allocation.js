const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true },
  studentName: { type: String, required: true, trim: true },
  roomNumber: { type: String, required: true, trim: true },
  block: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  status: { type: String, default: "Active" },
  reason: { type: String, default: "" },
  deallocatedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Allocation", allocationSchema);
