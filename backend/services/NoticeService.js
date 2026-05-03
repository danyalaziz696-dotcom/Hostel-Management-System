const Notice = require("../models/Notice");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class NoticeService {
  async list(query = {}) {
    return await Notice.find(query).sort({ date: -1, createdAt: -1 });
  }

  async listPublished() {
    return await Notice.find({
      published: true,
      status: "Active",
    }).sort({ date: -1, createdAt: -1 });
  }

  async getById(id) {
    const notice = await Notice.findById(id);
    if (!notice) throw serviceError(404, "Notice not found");
    return notice;
  }

  async create(data) {
    if (!data.title || !data.date) {
      throw serviceError(400, "title and date are required");
    }

    return await Notice.create({
      title: data.title,
      category: data.category || "General",
      date: data.date,
      content: data.content || "",
      author: data.author || "Admin",
      status: data.status || "Active",
      published: data.published !== undefined ? Boolean(data.published) : true,
      important: Boolean(data.important),
    });
  }

  async update(id, data) {
    const notice = await Notice.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!notice) throw serviceError(404, "Notice not found");
    return notice;
  }

  async remove(id) {
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) throw serviceError(404, "Notice not found");
    return { message: "Deleted", _id: notice._id };
  }
}

module.exports = new NoticeService();
