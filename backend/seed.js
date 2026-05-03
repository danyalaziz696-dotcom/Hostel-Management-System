const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

// import your models
const Room = require("./models/Room");
const Allocation = require("./models/Allocation");
const Student = require("./models/Student");
const Complaint = require("./models/Complaint");
const Payment = require("./models/Payment");
const Notice = require("./models/Notice");
const MessAttendance = require("./models/MessAttendance");
const MessCharge = require("./models/MessCharge");
const MessEnrollment = require("./models/MessEnrollment");
const MessMenu = require("./models/MessMenu");

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // 🔥 CLEAR DB
    await Promise.all([
      Room.deleteMany(),
      Allocation.deleteMany(),
      Student.deleteMany(),
      Complaint.deleteMany(),
      Payment.deleteMany(),
      Notice.deleteMany(),
      MessAttendance.deleteMany(),
      MessCharge.deleteMany(),
      MessEnrollment.deleteMany(),
      MessMenu.deleteMany(),
    ]);

    console.log("Database cleared");

    // 🛏 ROOMS
    const rooms = await Room.insertMany([
      { roomNumber: "A-101", block: "A", capacity: 2, occupied: 0, status: "Vacant" },
      { roomNumber: "A-102", block: "A", capacity: 2, occupied: 0, status: "Vacant" },
      { roomNumber: "B-201", block: "B", capacity: 3, occupied: 0, status: "Vacant" },
      { roomNumber: "C-301", block: "C", capacity: 1, occupied: 0, status: "Vacant" },
    ]);

    // 👨‍🎓 STUDENTS
    const students = await Student.insertMany([
      { studentId: "STU001", studentName: "Ali Khan", course: "BSCS", year: "2nd", phone: "03001234567" },
      { studentId: "STU002", studentName: "Ahmed Raza", course: "BBA", year: "3rd", phone: "03011234567" },
      { studentId: "STU003", studentName: "Usman Tariq", course: "MBA", year: "1st", phone: "03021234567" },
      { studentId: "STU004", studentName: "Fatima Noor", course: "BS Physics", year: "2nd", phone: "03031234567" },
      { studentId: "STU005", studentName: "Hassan Ali", course: "BS Mechanical", year: "4th", phone: "03041234567" },
    ]);

    // 🔑 ALLOCATIONS (linked properly)
    const allocations = [
      {
        studentId: "STU001",
        studentName: "Ali Khan",
        roomNumber: "A-101",
        block: "A",
        date: new Date(),
        status: "Active",
      },
      {
        studentId: "STU002",
        studentName: "Ahmed Raza",
        roomNumber: "A-101",
        block: "A",
        date: new Date(),
        status: "Active",
      },
      {
        studentId: "STU003",
        studentName: "Usman Tariq",
        roomNumber: "B-201",
        block: "B",
        date: new Date(),
        status: "Active",
      },
    ];

    await Allocation.insertMany(allocations);

    for (const allocation of allocations) {
      await Student.findOneAndUpdate(
        { studentId: allocation.studentId },
        { roomNumber: allocation.roomNumber, block: allocation.block }
      );
    }

    // 🔄 UPDATE ROOM OCCUPANCY (CRITICAL)
    for (let room of rooms) {
      const count = await Allocation.countDocuments({
        roomNumber: room.roomNumber,
        status: "Active",
      });

      room.occupied = count;
      room.status =
        count === 0
          ? "Vacant"
          : count < room.capacity
          ? "Available"
          : "Full";

      await room.save();
    }

    // 🔧 COMPLAINTS
    await Complaint.insertMany([
      {
        studentId: "STU001",
        studentName: "Ali Khan",
        roomNumber: "A-101",
        type: "Plumbing",
        desc: "Water leakage",
        status: "Pending",
        priority: "High",
        date: new Date(),
      },
      {
        studentId: "STU002",
        studentName: "Ahmed Raza",
        roomNumber: "A-101",
        type: "Electrical",
        desc: "Fan not working",
        status: "Resolved",
        priority: "Medium",
        date: new Date(),
      },
    ]);

    // 💰 PAYMENTS
    await Payment.insertMany([
  {
    studentId: "STU001",
    studentName: "Ali Khan",
    roomNumber: "A-101",
    month: "January",   // ✅ ADD THIS
    amount: 10000,
    paid: 10000,
    status: "Paid",
    date: new Date(),
  },
  {
    studentId: "STU002",
    studentName: "Ahmed Raza",
    roomNumber: "A-101",
    month: "January",   // ✅ ADD THIS
    amount: 10000,
    paid: 5000,
    status: "Partial",
    date: new Date(),
  },
  {
    studentId: "STU003",
    studentName: "Usman Tariq",
    roomNumber: "B-201",
    month: "January",   // ✅ ADD THIS
    amount: 10000,
    paid: 0,
    status: "Unpaid",
    date: new Date(),
  },
]);

    // 📢 NOTICES
    await Notice.insertMany([
      {
        title: "Hostel Rules",
        content: "Maintain discipline",
        category: "General",
        important: true,
        date: new Date(),
      },
      {
        title: "Mess Timing",
        content: "Dinner at 8 PM",
        category: "Mess",
        important: false,
        date: new Date(),
      },
    ]);

    await MessCharge.insertMany([
      { plan: "Full Board", monthly: 12000, desc: "Breakfast, lunch, snacks and dinner", status: "Active" },
      { plan: "Lunch & Dinner", monthly: 8500, desc: "Lunch and dinner only", status: "Active" },
      { plan: "Dinner Only", monthly: 4500, desc: "Dinner service only", status: "Active" },
    ]);

    await MessEnrollment.insertMany(students.map((student) => ({
      studentId: student.studentId,
      studentName: student.studentName,
      roomNumber: student.roomNumber || "",
      plan: "Full Board",
      feeStatus: "Unpaid",
      enrolled: new Date().toISOString().slice(0, 10),
      status: "Active",
    })));

    await MessMenu.insertMany([
      { day: "Monday", meals: { Breakfast: ["Paratha", "Omelette", "Tea"], Lunch: ["Chicken Biryani", "Raita"], Snacks: ["Samosa", "Tea"], Dinner: ["Daal", "Rice", "Salad"] } },
      { day: "Tuesday", meals: { Breakfast: ["Bread", "Egg", "Tea"], Lunch: ["Vegetable Rice", "Raita"], Snacks: ["Biscuits", "Tea"], Dinner: ["Chicken Karahi", "Roti", "Salad"] } },
      { day: "Wednesday", meals: { Breakfast: ["Paratha", "Chana", "Tea"], Lunch: ["Daal Chawal", "Pickle"], Snacks: ["Pakora", "Tea"], Dinner: ["Beef Pulao", "Raita"] } },
      { day: "Thursday", meals: { Breakfast: ["Bread", "Jam", "Tea"], Lunch: ["Chicken Qorma", "Roti"], Snacks: ["Fruit", "Tea"], Dinner: ["Mix Vegetable", "Roti", "Salad"] } },
      { day: "Friday", meals: { Breakfast: ["Halwa Puri", "Tea"], Lunch: ["Chicken Pulao", "Raita"], Snacks: ["Sandwich", "Tea"], Dinner: ["Daal Mash", "Roti", "Salad"] } },
      { day: "Saturday", meals: { Breakfast: ["Paratha", "Fried Egg", "Tea"], Lunch: ["Aloo Gosht", "Roti"], Snacks: ["Roll", "Tea"], Dinner: ["Chicken Manchurian", "Rice"] } },
      { day: "Sunday", meals: { Breakfast: ["Pancakes", "Tea"], Lunch: ["Chicken Roast", "Roti"], Snacks: ["Cake", "Tea"], Dinner: ["Daal", "Rice", "Salad"] } },
    ]);

    console.log("Seed data inserted successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
