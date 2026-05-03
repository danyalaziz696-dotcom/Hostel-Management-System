const mongoose = require("mongoose");

const MessMenuSchema = new mongoose.Schema({
  day: { type: String, required: true, trim: true },
  meals: {
    Breakfast: { type: [String], default: [] },
    Lunch: { type: [String], default: [] },
    Snacks: { type: [String], default: [] },
    Dinner: { type: [String], default: [] },
  },
}, { timestamps: true });

module.exports = mongoose.model("MessMenu", MessMenuSchema);
