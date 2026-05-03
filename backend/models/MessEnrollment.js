const mongoose = require("mongoose");

const MessEnrollmentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true },
  studentName: { type: String, required: true, trim: true },
  roomNumber: { type: String, default: "" },
  plan: { type: String, required: true, trim: true },
  feeStatus: { type: String, default: "Unpaid" },
  enrolled: { type: String, required: true },
  status: { type: String, default: "Active" },
}, { timestamps: true });

module.exports = mongoose.model("MessEnrollment", MessEnrollmentSchema);
