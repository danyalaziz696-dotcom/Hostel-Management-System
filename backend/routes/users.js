const express = require("express");
const router = express.Router();
const userService = require("../services/UserService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}

router.get("/users", async (req, res) => {
  try {
    res.json(await userService.list());
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/users", async (req, res) => {
  try {
    res.json(await userService.create(req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    res.json(await userService.getById(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    res.json(await userService.update(req.params.id, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    res.json(await userService.remove(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
