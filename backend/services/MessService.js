const MessAttendance = require("../models/MessAttendance");
const MessMenu = require("../models/MessMenu");
const MessCharge = require("../models/MessCharge");
const MessEnrollment = require("../models/MessEnrollment");
const Student = require("../models/Student");
const Allocation = require("../models/Allocation");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const DEFAULT_CHARGES = [
  { plan: "Full Board", monthly: 12000, desc: "Breakfast, lunch, snacks and dinner", status: "Active" },
  { plan: "Lunch & Dinner", monthly: 8500, desc: "Lunch and dinner only", status: "Active" },
  { plan: "Dinner Only", monthly: 4500, desc: "Dinner service only", status: "Active" },
];

const DEFAULT_MENU = [
  { day: "Monday", meals: { Breakfast: ["Paratha", "Omelette", "Tea"], Lunch: ["Chicken Biryani", "Raita"], Snacks: ["Samosa", "Tea"], Dinner: ["Daal", "Rice", "Salad"] } },
  { day: "Tuesday", meals: { Breakfast: ["Bread", "Egg", "Tea"], Lunch: ["Vegetable Rice", "Raita"], Snacks: ["Biscuits", "Tea"], Dinner: ["Chicken Karahi", "Roti", "Salad"] } },
  { day: "Wednesday", meals: { Breakfast: ["Paratha", "Chana", "Tea"], Lunch: ["Daal Chawal", "Pickle"], Snacks: ["Pakora", "Tea"], Dinner: ["Beef Pulao", "Raita"] } },
  { day: "Thursday", meals: { Breakfast: ["Bread", "Jam", "Tea"], Lunch: ["Chicken Qorma", "Roti"], Snacks: ["Fruit", "Tea"], Dinner: ["Mix Vegetable", "Roti", "Salad"] } },
  { day: "Friday", meals: { Breakfast: ["Halwa Puri", "Tea"], Lunch: ["Chicken Pulao", "Raita"], Snacks: ["Sandwich", "Tea"], Dinner: ["Daal Mash", "Roti", "Salad"] } },
  { day: "Saturday", meals: { Breakfast: ["Paratha", "Fried Egg", "Tea"], Lunch: ["Aloo Gosht", "Roti"], Snacks: ["Roll", "Tea"], Dinner: ["Chicken Manchurian", "Rice"] } },
  { day: "Sunday", meals: { Breakfast: ["Pancakes", "Tea"], Lunch: ["Chicken Roast", "Roti"], Snacks: ["Cake", "Tea"], Dinner: ["Daal", "Rice", "Salad"] } },
];

class MessService {
  async listAttendance(query = {}) {
    return await MessAttendance.find(query).sort({ date: -1, createdAt: -1 });
  }

  async createAttendance(data) {
    const present = Number(data.present);
    const total = Number(data.total);

    if (!data.date || !data.meal) {
      throw serviceError(400, "date and meal are required");
    }

    if (!Number.isFinite(present) || !Number.isFinite(total) || present < 0 || total < 0 || present > total) {
      throw serviceError(400, "present and total must be valid attendance numbers");
    }

    return await MessAttendance.create({
      date: data.date,
      meal: data.meal,
      present,
      absent: total - present,
      total,
    });
  }

  async listMenu(query = {}) {
    if (Object.keys(query).length === 0 && await MessMenu.countDocuments() === 0) {
      await MessMenu.bulkWrite(DEFAULT_MENU.map((menu) => ({
        updateOne: {
          filter: { day: menu.day },
          update: { $setOnInsert: menu },
          upsert: true,
        },
      })));
    }
    return await MessMenu.find(query).sort({ day: 1 });
  }

  async upsertMenu(data) {
    const day = String(data.day || "").trim();
    if (!day) {
      throw serviceError(400, "day is required");
    }

    return await MessMenu.findOneAndUpdate(
      { day },
      { day, meals: data.meals || {} },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async listCharges() {
    if (await MessCharge.countDocuments() === 0) {
      await MessCharge.bulkWrite(DEFAULT_CHARGES.map((charge) => ({
        updateOne: {
          filter: { plan: charge.plan },
          update: { $setOnInsert: charge },
          upsert: true,
        },
      })));
    }
    return await MessCharge.find().sort({ plan: 1 });
  }

  async createCharge(data) {
    const plan = String(data.plan || "").trim();
    const monthly = Number(data.monthly);

    if (!plan || !Number.isFinite(monthly) || monthly < 0) {
      throw serviceError(400, "Invalid input data");
    }

    const duplicate = await MessCharge.findOne({ plan });
    if (duplicate) throw serviceError(400, "Mess charge already exists");

    return await MessCharge.create({
      plan,
      monthly,
      desc: data.desc || "",
      status: data.status || "Active",
    });
  }

  async updateCharge(id, data) {
    if (data.monthly !== undefined) {
      const monthly = Number(data.monthly);
      if (!Number.isFinite(monthly) || monthly < 0) throw serviceError(400, "Invalid input data");
      data.monthly = monthly;
    }

    const charge = await MessCharge.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!charge) throw serviceError(404, "Mess charge not found");
    return charge;
  }

  async listStudents() {
    const activeEnrollments = await MessEnrollment.find({ status: "Active" }).sort({ studentId: 1 });
    if (activeEnrollments.length > 0) {
      return activeEnrollments;
    }

    await this.listCharges();
    const students = await Student.find({ status: { $ne: "Inactive" } }).sort({ studentId: 1 });
    if (students.length === 0) {
      return [];
    }

    const today = new Date().toISOString().slice(0, 10);
    const activeAllocations = await Allocation.find({ status: "Active" }).lean();
    const roomByStudent = new Map(activeAllocations.map((allocation) => [allocation.studentId, allocation.roomNumber]));

    await MessEnrollment.bulkWrite(students.map((student) => ({
      updateOne: {
        filter: { studentId: student.studentId, status: "Active" },
        update: {
          $setOnInsert: {
            studentId: student.studentId,
            studentName: student.studentName,
            roomNumber: student.roomNumber || roomByStudent.get(student.studentId) || "",
            plan: "Full Board",
            feeStatus: "Unpaid",
            enrolled: student.joinDate || today,
            status: "Active",
          },
        },
        upsert: true,
      },
    })));

    return await MessEnrollment.find({ status: "Active" }).sort({ studentId: 1 });
  }

  async enrollStudent(data) {
    const studentId = String(data.studentId || "").trim();
    const plan = String(data.plan || "").trim();

    if (!studentId || !plan || !data.enrolled) {
      throw serviceError(400, "Invalid input data");
    }

    const student = await Student.findOne({ studentId, status: { $ne: "Inactive" } });
    if (!student) throw serviceError(400, "Invalid student ID");

    const charge = await MessCharge.findOne({ plan, status: "Active" });
    if (!charge) throw serviceError(404, "Mess charge not found");

    const existing = await MessEnrollment.findOne({ studentId, status: "Active" });
    if (existing) throw serviceError(400, "Student is already enrolled");

    return await MessEnrollment.create({
      studentId,
      studentName: data.studentName || student.studentName,
      roomNumber: data.roomNumber || student.roomNumber || "",
      plan,
      feeStatus: data.feeStatus || "Unpaid",
      enrolled: data.enrolled,
      status: "Active",
    });
  }
}

module.exports = new MessService();
