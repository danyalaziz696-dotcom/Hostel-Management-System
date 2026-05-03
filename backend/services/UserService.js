const User = require("../models/User");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class UserService {
  async list(query = {}) {
    return await User.find(query).sort({ username: 1 });
  }

  async getById(id) {
    const user = await User.findById(id);
    if (!user) throw serviceError(404, "User not found");
    return user;
  }

  async create(data) {
    if (!data.username || !data.password || !data.role) {
      throw serviceError(400, "username, password and role are required");
    }

    const duplicate = await User.findOne({ username: data.username, role: data.role });
    if (duplicate) throw serviceError(400, "User already exists");

    return await User.create({
      name: data.name,
      username: data.username,
      password: data.password,
      role: data.role,
      email: data.email,
      studentId: data.studentId,
      status: data.status || "Active",
    });
  }

  async update(id, data) {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw serviceError(404, "User not found");
    return user;
  }

  async remove(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw serviceError(404, "User not found");
    return { message: "Deleted", _id: user._id };
  }
}

module.exports = new UserService();
