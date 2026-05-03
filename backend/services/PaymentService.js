const Payment = require("../models/Payment");
const Student = require("../models/Student");

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class PaymentService {
  getStatus(amount, paid) {
    if (paid >= amount) return "Paid";
    if (paid > 0) return "Partial";
    return "Unpaid";
  }

  async normalize(data) {
    const amount = Number(data.amount);
    const paid = Number(data.paid ?? data.amountPaid ?? 0);

    if (!data.studentId || !(data.studentName || data.name) || !data.month) {
      throw serviceError(400, "studentId, studentName and month are required");
    }

    if (!Number.isFinite(amount) || amount < 0) {
      throw serviceError(400, "amount must be a valid number");
    }

    if (!Number.isFinite(paid) || paid < 0) {
      throw serviceError(400, "paid must be a valid number");
    }

    const student = await Student.findOne({ studentId: data.studentId, status: { $ne: "Inactive" } });
    if (!student) throw serviceError(400, "Invalid student ID");

    return {
      studentId: data.studentId,
      studentName: data.studentName || data.name || student.studentName,
      roomNumber: data.roomNumber || data.room || student.roomNumber || "",
      month: data.month,
      amount,
      paid,
      method: data.method || "-",
      date: data.date || "",
      transactionId: data.transactionId || data.txn || "",
      status: this.getStatus(amount, paid),
    };
  }

  async list(query = {}) {
    return await Payment.find(query).sort({ createdAt: -1 });
  }

  async create(data) {
    return await Payment.create(await this.normalize(data));
  }

  async update(id, data) {
    const existing = await Payment.findById(id);
    if (!existing) throw serviceError(404, "Payment not found");

    Object.assign(existing, data);
    existing.studentName = existing.studentName || data.name;
    existing.roomNumber = existing.roomNumber || data.room;
    existing.transactionId = existing.transactionId || data.txn;
    const amount = Number(existing.amount);
    const paid = Number(existing.paid || 0);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(paid) || paid < 0) {
      throw serviceError(400, "Invalid payment amount");
    }
    existing.status = this.getStatus(amount, paid);
    await existing.save();
    console.log(`payment updated: ${existing._id}`);
    return existing;
  }

  async markPaid(id, data = {}) {
    const payment = await Payment.findById(id);
    if (!payment) throw serviceError(404, "Payment not found");

    payment.paid = Number(data.paid ?? payment.amount);
    if (!Number.isFinite(payment.paid) || payment.paid < 0) {
      throw serviceError(400, "Invalid payment amount");
    }
    payment.method = data.method || payment.method || "Online";
    payment.date = data.date || new Date().toISOString().slice(0, 10);
    payment.transactionId = data.transactionId || data.txn || payment.transactionId;
    payment.status = this.getStatus(Number(payment.amount), Number(payment.paid));
    await payment.save();
    console.log(`payment updated: ${payment._id}`);
    return payment;
  }

  async remove(id) {
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) throw serviceError(404, "Payment not found");
    return { message: "Deleted", _id: payment._id };
  }
}

module.exports = new PaymentService();
