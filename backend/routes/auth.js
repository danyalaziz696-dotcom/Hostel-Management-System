const express = require("express");
const router = express.Router();
const authService = require("../services/AuthService");

function handleError(res, err) {
  const status = err.statusCode || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  const message = err.message || "Server error";
  res.status(status).json({ error: message, message });
}

async function login(req, res) {
  try {
    const { username, password, role } = req.body;
    const user = await authService.login(username, password, role);

    res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    handleError(res, err);
  }
}

router.post("/login", login);
router.post("/auth/login", login);

module.exports = router;
