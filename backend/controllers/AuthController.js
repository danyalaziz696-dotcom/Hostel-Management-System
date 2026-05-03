const authService = require("../services/AuthService");

class AuthController {
  async login(req, res) {
    const { username, password, role } = req.body;

    const user = await authService.login(username, password, role);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user
    });
  }
}

module.exports = new AuthController();