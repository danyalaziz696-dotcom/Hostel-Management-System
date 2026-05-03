const mongoose = require("mongoose");

const MessChargeSchema = new mongoose.Schema({
  plan: { type: String, required: true, trim: true },
  monthly: { type: Number, required: true, min: 0 },
  desc: { type: String, default: "" },
  status: { type: String, default: "Active" },
}, { timestamps: true });

module.exports = mongoose.model("MessCharge", MessChargeSchema);
