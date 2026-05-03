const express = require("express");
const router = express.Router();
const reportService = require("../services/ReportService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/reports/occupancy", async (req, res) => {
  try {
    res.json(await reportService.occupancy());
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/reports/revenue", async (req, res) => {
  try {
    res.json(await reportService.revenue());
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/reports/complaints", async (req, res) => {
  try {
    res.json(await reportService.complaints());
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
