const Student = require("../models/Student");
const Allocation = require("../models/Allocation");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class StudentService {
  async list(query = {}) {
    const [students, activeAllocations] = await Promise.all([
      Student.find(query).sort({ studentId: 1 }).lean(),
      Allocation.find({ status: "Active" }).lean(),
    ]);
    const allocationByStudent = new Map(activeAllocations.map((allocation) => [allocation.studentId, allocation]));

    return students.map((student) => {
      const allocation = allocationByStudent.get(student.studentId);
      if (!allocation || student.roomNumber) {
        return student;
      }
      return {
        ...student,
        roomNumber: allocation.roomNumber,
        block: student.block || allocation.block,
      };
    });
  }

  async getById(id) {
    const student = await Student.findById(id);
    if (!student) throw serviceError(404, "Student not found");
    return student;
  }

  async create(data) {
    const studentId = String(data.studentId || "").trim();
    const studentName = String(data.studentName || data.name || "").trim();

    if (!studentId || !studentName) {
      throw serviceError(400, "studentId and studentName are required");
    }

    const duplicate = await Student.findOne({ studentId });
    if (duplicate) throw serviceError(400, "Student already exists");

    return await Student.create({
      studentId,
      studentName,
      course: data.course,
      year: data.year,
      phone: data.phone,
      email: data.email,
      roomNumber: data.roomNumber || data.room,
      block: data.block,
      joinDate: data.joinDate,
      status: data.status || "Active",
    });
  }

  async update(id, data) {
    if (data.studentId) {
      const duplicate = await Student.findOne({ studentId: data.studentId, _id: { $ne: id } });
      if (duplicate) throw serviceError(400, "Student already exists");
    }

    const payload = {
      studentId: data.studentId,
      studentName: data.studentName || data.name,
      course: data.course,
      year: data.year,
      phone: data.phone,
      email: data.email,
      roomNumber: data.roomNumber || data.room,
      block: data.block,
      joinDate: data.joinDate,
      status: data.status,
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const student = await Student.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!student) throw serviceError(404, "Student not found");
    return student;
  }

  async remove(id) {
    const student = await this.getById(id);
    const activeAllocation = await Allocation.findOne({
      studentId: student.studentId,
      status: "Active",
    });

    if (activeAllocation) {
      throw serviceError(400, "Cannot delete student with active allocation");
    }

    await Student.findByIdAndDelete(id);
    return { message: "Deleted", _id: student._id };
  }
}

module.exports = new StudentService();
