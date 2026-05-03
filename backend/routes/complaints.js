const express = require("express");
const router = express.Router();
const complaintService = require("../services/ComplaintService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/complaints", async (req, res) => {
  try {
    res.json(await complaintService.list(req.query.studentId ? { studentId: req.query.studentId } : {}));
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/complaints", async (req, res) => {
  try {
    res.json(await complaintService.create(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/complaints/:id", async (req, res) => {
  try {
    res.json(await complaintService.getById(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/complaints/:id", async (req, res) => {
  try {
    res.json(await complaintService.update(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.patch("/complaints/:id", async (req, res) => {
  try {
    res.json(await complaintService.update(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/complaints/:id", async (req, res) => {
  try {
    res.json(await complaintService.remove(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
