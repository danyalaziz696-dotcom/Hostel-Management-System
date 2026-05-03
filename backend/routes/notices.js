const express = require("express");
const router = express.Router();
const noticeService = require("../services/NoticeService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/notices", async (req, res) => {
  try {
    const notices = req.query.published === "true"
      ? await noticeService.listPublished()
      : await noticeService.list();
    res.json(notices);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/notices/published", async (req, res) => {
  try {
    res.json(await noticeService.listPublished());
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/notices", async (req, res) => {
  try {
    res.json(await noticeService.create(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/notices/:id", async (req, res) => {
  try {
    res.json(await noticeService.getById(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/notices/:id", async (req, res) => {
  try {
    res.json(await noticeService.update(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/notices/:id", async (req, res) => {
  try {
    res.json(await noticeService.remove(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
