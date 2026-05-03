const Allocation = require("../models/Allocation");
const Room = require("../models/Room");
const Student = require("../models/Student");
const roomService = require("./RoomService");
const mongoose = require("mongoose");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class AllocationService {
  assertValidId(id, label = "Record") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw serviceError(400, `Invalid ${label.toLowerCase()} ID`);
    }
  }

  async getAllAllocations(options = {}) {
    const query = options.includeDeallocated ? {} : { status: "Active" };
    return await Allocation.find(query).sort({ createdAt: -1 });
  }

  async getAllocationById(id) {
    this.assertValidId(id, "Allocation");
    const allocation = await Allocation.findById(id);

    if (!allocation) {
      throw serviceError(404, "Allocation not found");
    }

    return allocation;
  }

  async getStats() {
    const [allocations, rooms] = await Promise.all([
      Allocation.find(),
      Room.find(),
    ]);
    const active = allocations.filter((allocation) => allocation.status === "Active").length;
    const waitlisted = allocations.filter((allocation) => allocation.status === "Waitlisted").length;
    const availableRooms = rooms.filter((room) => Number(room.occupied || 0) < Number(room.capacity || 0)).length;

    return {
      totalAllocations: allocations.length,
      active,
      availableRooms,
      waitlisted,
      message: allocations.length || rooms.length ? "" : "No records found",
    };
  }

  validateAllocationData(data) {
    const payload = {
      studentId: String(data.studentId || "").trim(),
      studentName: String(data.studentName || "").trim(),
      roomNumber: String(data.roomNumber || "").trim(),
      block: String(data.block || "").trim(),
      date: String(data.date || "").trim(),
      status: "Active",
    };

    const missing = ["studentId", "studentName", "roomNumber", "block", "date"].filter((field) => !payload[field]);

    if (missing.length > 0) {
      throw serviceError(400, "Invalid input data");
    }

    return payload;
  }

  async createAllocation(data) {
    const payload = this.validateAllocationData(data);
    const session = await mongoose.startSession();
    let allocation;

    try {
      await session.withTransaction(async () => {
        const student = await Student.findOne({
          studentId: payload.studentId,
          status: { $ne: "Inactive" },
        }).session(session);

        if (!student) {
          console.log("allocation rejected: Invalid student ID");
          throw serviceError(400, "Invalid student ID");
        }

        const duplicate = await Allocation.findOne({
          studentId: payload.studentId,
          status: "Active",
        }).session(session);

        if (duplicate) {
          console.log("allocation rejected: Student already has an active allocation");
          throw serviceError(400, "Student already has an active allocation");
        }

        const room = await Room.findOne({ roomNumber: payload.roomNumber }).session(session);

        if (!room) {
          console.log("allocation rejected: Room not found");
          throw serviceError(404, "Room not found");
        }

        const activeCount = await Allocation.countDocuments({
          roomNumber: payload.roomNumber,
          status: "Active",
        }).session(session);

        if (activeCount >= Number(room.capacity)) {
          console.log("allocation rejected: Room is already full");
          throw serviceError(400, "Room is already full");
        }

        const created = await Allocation.create([payload], { session });
        allocation = created[0];

        student.studentName = payload.studentName;
        student.roomNumber = payload.roomNumber;
        student.block = payload.block;
        await student.save({ session });

        await roomService.syncRoomOccupancy(payload.roomNumber, session);
      });
    } catch (err) {
      console.error("allocation error:", err.stack || err.message);
      throw err;
    } finally {
      await session.endSession();
    }

    console.log("allocation created: Room allocated successfully");
    const result = allocation.toObject();
    result.message = "Room allocated successfully";
    return result;
  }

  async deallocateAllocation(id, reason = "") {
    this.assertValidId(id, "Allocation");
    const session = await mongoose.startSession();
    let allocation;

    try {
      await session.withTransaction(async () => {
        allocation = await Allocation.findById(id).session(session);

        if (!allocation) {
          throw serviceError(404, "Allocation not found");
        }

        if (allocation.status === "Deallocated") {
          return;
        }

        allocation.status = "Deallocated";
        allocation.reason = String(reason || allocation.reason || "");
        allocation.deallocatedAt = new Date();
        await allocation.save({ session });

        await Student.findOneAndUpdate(
          { studentId: allocation.studentId },
          { roomNumber: "", block: "" },
          { new: true, session }
        );

        await roomService.syncRoomOccupancy(allocation.roomNumber, session);
      });
    } catch (err) {
      console.error("deallocation error:", err.stack || err.message);
      throw err;
    } finally {
      await session.endSession();
    }

    console.log("deallocation completed");
    return allocation;
  }
}

module.exports = new AllocationService();
