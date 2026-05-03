const express = require("express");
const router = express.Router();
const messService = require("../services/MessService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/mess", async (req, res) => {
  try {
    const [attendance, menu, charges, students] = await Promise.all([
      messService.listAttendance(),
      messService.listMenu(),
      messService.listCharges(),
      messService.listStudents(),
    ]);
    res.json({ attendance, menu, charges, students });
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/mess/attendance", async (req, res) => {
  try {
    res.json(await messService.listAttendance());
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/mess/attendance", async (req, res) => {
  try {
    res.json(await messService.createAttendance(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/mess/menu", async (req, res) => {
  try {
    res.json(await messService.listMenu());
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/mess/menu", async (req, res) => {
  try {
    res.json(await messService.upsertMenu(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/mess/menu/:day", async (req, res) => {
  try {
    res.json(await messService.upsertMenu({ ...req.body, day: req.params.day }));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/mess/charges", async (req, res) => {
  try {
    res.json(await messService.listCharges());
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/mess/charges", async (req, res) => {
  try {
    res.json(await messService.createCharge(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/mess/charges/:id", async (req, res) => {
  try {
    res.json(await messService.updateCharge(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/mess/students", async (req, res) => {
  try {
    res.json(await messService.listStudents());
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/mess/students", async (req, res) => {
  try {
    res.json(await messService.enrollStudent(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
