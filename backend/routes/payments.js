const express = require("express");
const router = express.Router();
const paymentService = require("../services/PaymentService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/payments", async (req, res) => {
  try {
    res.json(await paymentService.list(req.query.studentId ? { studentId: req.query.studentId } : {}));
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/payments", async (req, res) => {
  try {
    res.json(await paymentService.create(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/payments/:id", async (req, res) => {
  try {
    const payments = await paymentService.list({ _id: req.params.id });
    if (!payments.length) return res.status(404).json({ error: "Payment not found" });
    res.json(payments[0]);
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/payments/:id", async (req, res) => {
  try {
    res.json(await paymentService.update(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.patch("/payments/:id/pay", async (req, res) => {
  try {
    res.json(await paymentService.markPaid(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/payments/:id", async (req, res) => {
  try {
    res.json(await paymentService.remove(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
