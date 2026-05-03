const Room = require("../models/Room");
const Allocation = require("../models/Allocation");
const mongoose = require("mongoose");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class RoomService {
  assertValidId(id, label = "Record") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw serviceError(400, `Invalid ${label.toLowerCase()} ID`);
    }
  }

  getRoomStatus(occupied, capacity) {
    if (occupied <= 0) return "Vacant";
    if (occupied >= capacity) return "Full";
    return "Available";
  }

  normalizeRoomData(data) {
    const roomNumber = String(data.roomNumber || "").trim();
    const capacity = Number(data.capacity);
    const occupied = 0;

    if (!roomNumber) {
      throw serviceError(400, "roomNumber is required");
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      throw serviceError(400, "capacity must be a positive number");
    }

    return {
      roomNumber,
      block: String(data.block || roomNumber.split("-")[0] || "").trim(),
      type: String(data.type || "Standard").trim(),
      capacity,
      occupied,
      status: this.getRoomStatus(occupied, capacity),
    };
  }

  async getAllRooms() {
    return await Room.find().sort({ roomNumber: 1 });
  }

  async createRoom(data) {
    const payload = this.normalizeRoomData(data);
    const existing = await Room.findOne({ roomNumber: payload.roomNumber });

    if (existing) {
      throw serviceError(400, "Room already exists");
    }

    const room = await Room.create(payload);
    console.log(`room created: ${room.roomNumber}`);
    return room;
  }

  async getRoomById(id) {
    this.assertValidId(id, "Room");
    const room = await Room.findById(id);
    if (!room) throw serviceError(404, "Room not found");
    return room;
  }

  async updateRoom(id, data) {
    this.assertValidId(id, "Room");
    const room = await Room.findById(id);

    if (!room) {
      throw serviceError(404, "Room not found");
    }

    const oldRoomNumber = room.roomNumber;
    const activeCount = await Allocation.countDocuments({
      roomNumber: oldRoomNumber,
      status: "Active",
    });
    const nextRoomNumber = data.roomNumber ? String(data.roomNumber).trim() : oldRoomNumber;
    const nextCapacity = data.capacity === undefined ? Number(room.capacity) : Number(data.capacity);
    const nextOccupied = activeCount;

    if (!nextRoomNumber) {
      throw serviceError(400, "Room number is required");
    }

    if (!Number.isFinite(nextCapacity) || nextCapacity < 1) {
      throw serviceError(400, "Capacity must be a positive number");
    }

    if (nextCapacity < activeCount) {
      throw serviceError(400, "Capacity cannot be less than active allocations");
    }

    if (nextOccupied > nextCapacity) {
      throw serviceError(400, "Occupied beds cannot be greater than capacity");
    }

    if (nextRoomNumber !== oldRoomNumber) {
      const duplicate = await Room.findOne({ roomNumber: nextRoomNumber, _id: { $ne: room._id } });
      if (duplicate) throw serviceError(400, "Room already exists");
    }

    room.roomNumber = nextRoomNumber;
    room.block = String(data.block || room.block || nextRoomNumber.split("-")[0] || "").trim();
    room.type = String(data.type || room.type || "Standard").trim();
    room.capacity = nextCapacity;
    room.occupied = nextOccupied;
    room.status = this.getRoomStatus(nextOccupied, nextCapacity);
    await room.save();

    if (nextRoomNumber !== oldRoomNumber) {
      await Allocation.updateMany({ roomNumber: oldRoomNumber }, { roomNumber: nextRoomNumber, block: room.block });
    }

    return room;
  }

  async getAvailability(roomNumber) {
    const room = await Room.findOne({ roomNumber: String(roomNumber || "").trim() });

    if (!room) {
      throw serviceError(404, "Room not found");
    }

    const capacity = Number(room.capacity || 0);
    const occupied = Number(room.occupied || 0);
    const availableBeds = Math.max(0, capacity - occupied);

    return {
      _id: room._id,
      roomNumber: room.roomNumber,
      block: room.block || "",
      status: room.status,
      capacity,
      occupied,
      availableBeds,
      available: availableBeds > 0,
      message: availableBeds > 0 ? "Room is available" : "Room is already full",
    };
  }

  async deleteRoom(id) {
    this.assertValidId(id, "Room");
    const room = await Room.findById(id);

    if (!room) {
      throw serviceError(404, "Room not found");
    }

    const activeAllocation = await Allocation.findOne({
      roomNumber: room.roomNumber,
      status: "Active",
    });

    if (activeAllocation) {
      console.log(`room delete blocked: ${room.roomNumber} has active allocations`);
      throw serviceError(400, "Cannot delete room with active allocations");
    }

    await Room.findByIdAndDelete(id);
    console.log(`room deleted: ${room.roomNumber}`);
    return { message: "Deleted", _id: room._id };
  }

  async updateRoomOccupancy(roomNumber, delta) {
    const room = await Room.findOne({ roomNumber });

    if (!room) {
      throw serviceError(404, "Room not found");
    }

    const nextOccupied = Math.max(0, Number(room.occupied || 0) + delta);
    if (nextOccupied > Number(room.capacity)) {
      throw serviceError(400, "Room is already full");
    }
    room.occupied = nextOccupied;
    room.status = this.getRoomStatus(nextOccupied, Number(room.capacity));
    await room.save();

    return room;
  }

  async syncRoomOccupancy(roomNumber, session = null) {
    const roomQuery = Room.findOne({ roomNumber });
    if (session) roomQuery.session(session);
    const room = await roomQuery;
    if (!room) throw serviceError(404, "Room not found");

    const countQuery = Allocation.countDocuments({ roomNumber, status: "Active" });
    if (session) countQuery.session(session);
    const activeCount = await countQuery;
    if (activeCount > Number(room.capacity)) {
      throw serviceError(400, "Room is already full");
    }

    room.occupied = activeCount;
    room.status = this.getRoomStatus(Number(room.occupied), Number(room.capacity));
    await room.save(session ? { session } : undefined);
    return room;
  }
}

module.exports = new RoomService();
