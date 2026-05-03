const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true },
  studentName: { type: String, required: true, trim: true },
  roomNumber: { type: String, trim: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paid: { type: Number, default: 0, min: 0 },
  method: { type: String, default: "-" },
  date: { type: String, default: "" },
  transactionId: { type: String, default: "" },
  status: { type: String, default: "Unpaid" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
