const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, default: "General" },
  date: { type: String, required: true },
  content: { type: String, default: "" },
  author: { type: String, default: "Admin" },
  status: { type: String, default: "Active" },
  published: { type: Boolean, default: true },
  important: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notice", NoticeSchema);
