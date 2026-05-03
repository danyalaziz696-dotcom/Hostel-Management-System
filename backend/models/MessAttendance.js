const mongoose = require("mongoose");

const MessAttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  meal: { type: String, required: true },
  present: { type: Number, required: true, min: 0 },
  absent: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model("MessAttendance", MessAttendanceSchema);
