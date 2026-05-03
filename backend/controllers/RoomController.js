const roomService = require("../services/RoomService");

class RoomController {
  async getRooms(req, res) {
    const rooms = await roomService.getAllRooms();
    res.json(rooms);
  }

  async createRoom(req, res) {
    const room = await roomService.createRoom(req.body);
    res.json(room);
  }
}

module.exports = new RoomController();