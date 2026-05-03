const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, trim: true },
  block: { type: String, trim: true },
  type: { type: String, default: "Standard", trim: true },
  capacity: { type: Number, required: true, min: 1 },
  occupied: { type: Number, default: 0, min: 0 },
  status: { type: String, default: "Vacant" },
}, { timestamps: true });

module.exports = mongoose.model("Room", RoomSchema);
