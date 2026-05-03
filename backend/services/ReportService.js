const Room = require("../models/Room");
const Payment = require("../models/Payment");
const Complaint = require("../models/Complaint");

class ReportService {
  async occupancy() {
    const rooms = await Room.find();
    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum, room) => sum + Number(room.capacity || 0), 0);
    const totalOccupied = rooms.reduce((sum, room) => sum + Number(room.occupied || 0), 0);
    const availableBeds = Math.max(0, totalCapacity - totalOccupied);

    return {
      message: totalRooms ? "" : "No records found",
      totalRooms,
      totalCapacity,
      totalOccupied,
      availableBeds,
      occupancyRate: totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
      rooms,
    };
  }

  async revenue() {
    const payments = await Payment.find();
    const totalExpected = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.paid || 0), 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);

    return {
      message: payments.length ? "" : "No records found",
      totalExpected,
      totalCollected,
      totalPending,
      collectionRate: totalExpected ? Math.round((totalCollected / totalExpected) * 100) : 0,
      payments,
    };
  }

  async complaints() {
    const complaints = await Complaint.find();
    const pending = complaints.filter((complaint) => complaint.status === "Pending").length;
    const inProgress = complaints.filter((complaint) => complaint.status === "In Progress").length;
    const resolved = complaints.filter((complaint) => complaint.status === "Resolved").length;

    return {
      message: complaints.length ? "" : "No records found",
      totalComplaints: complaints.length,
      pending,
      inProgress,
      resolved,
      complaints,
    };
  }
}

module.exports = new ReportService();
