const Complaint = require("../models/Complaint");
const Student = require("../models/Student");
const Allocation = require("../models/Allocation");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class ComplaintService {
  async list(query = {}) {
    return await Complaint.find(query).sort({ createdAt: -1 });
  }

  async getById(id) {
    const complaint = await Complaint.findById(id);
    if (!complaint) throw serviceError(404, "Complaint not found");
    return complaint;
  }

  async create(data) {
    const type = String(data.type || "").trim();
    const desc = String(data.desc || data.description || "").trim();
    const studentId = String(data.studentId || "").trim();

    if (!studentId || !type || !desc) {
      throw serviceError(400, "Invalid input data");
    }

    const student = await Student.findOne({ studentId, status: { $ne: "Inactive" } });
    if (!student) throw serviceError(400, "Invalid student ID");
    const allocation = await Allocation.findOne({ studentId, status: "Active" });

    const duplicate = await Complaint.findOne({
      studentId,
      type,
      desc,
      status: { $in: ["Pending", "In Progress"] },
    });
    if (duplicate) throw serviceError(400, "Complaint already exists");

    return await Complaint.create({
      studentId,
      studentName: data.studentName || data.student || student.studentName,
      roomNumber: data.roomNumber || data.room || student.roomNumber || allocation?.roomNumber || "",
      type,
      desc,
      date: data.date || new Date().toISOString().slice(0, 10),
      priority: data.priority || "Medium",
      status: data.status || "Pending",
    });
  }

  async update(id, data) {
    if (data.status && !["Pending", "In Progress", "Resolved"].includes(data.status)) {
      throw serviceError(400, "Invalid complaint status");
    }

    const complaint = await Complaint.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!complaint) throw serviceError(404, "Complaint not found");
    return complaint;
  }

  async remove(id) {
    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) throw serviceError(404, "Complaint not found");
    return { message: "Deleted", _id: complaint._id };
  }
}

module.exports = new ComplaintService();
