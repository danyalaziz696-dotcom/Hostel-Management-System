const express = require("express");
const router = express.Router();
const roomService = require("../services/RoomService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  if (status === 500) console.error("room route error:", err.stack || err.message);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/rooms", async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    res.json(rooms);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/rooms/availability/:roomNumber", async (req, res) => {
  try {
    const availability = await roomService.getAvailability(req.params.roomNumber);
    res.json(availability);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/rooms", async (req, res) => {
  try {
    const room = await roomService.createRoom(req.body);
    res.json(room);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/rooms/:id", async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.json(room);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/rooms/:id", async (req, res) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    res.json(room);
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/rooms/:id", async (req, res) => {
  try {
    const result = await roomService.deleteRoom(req.params.id);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
