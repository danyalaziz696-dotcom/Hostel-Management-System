const User = require("../models/User");
const Student = require("../models/Student");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class AuthService {
  async login(username, password, role) {
    const cleanUsername = String(username || "").trim();
    const cleanPassword = String(password || "").trim();
    const cleanRole = String(role || "").trim();

    if (!cleanUsername || !cleanPassword || !cleanRole) {
      throw serviceError(400, "Invalid input data");
    }

    const user = await User.findOne({
      username: cleanUsername,
      password: cleanPassword,
      role: cleanRole,
      status: { $ne: "Inactive" },
    });

    if (!user) {
      throw serviceError(401, "Invalid credentials");
    }

    if (user.role !== "Student") {
      return user;
    }

    const student = await Student.findOne({
      status: { $ne: "Inactive" },
      $or: [
        { studentId: user.studentId || cleanUsername },
        { studentId: cleanUsername },
        { studentName: user.name || cleanUsername },
        { email: user.email || cleanUsername },
      ],
    }).sort({ studentId: 1 });

    const fallbackStudent = student || await Student.findOne({ status: { $ne: "Inactive" } }).sort({ studentId: 1 });
    const userData = user.toObject();

    if (fallbackStudent) {
      userData.studentId = fallbackStudent.studentId;
      userData.name = userData.name || fallbackStudent.studentName;
    }

    return userData;
  }
}

module.exports = new AuthService();
