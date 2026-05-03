const express = require("express");
const router = express.Router();
const studentService = require("../services/StudentService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/students", async (req, res) => {
  try {
    res.json(await studentService.list());
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/students", async (req, res) => {
  try {
    res.json(await studentService.create(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/students/:id", async (req, res) => {
  try {
    res.json(await studentService.getById(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    res.json(await studentService.update(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    res.json(await studentService.remove(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
