const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB().catch(() => {
  console.error("Server started without a database connection");
});

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/users"));
app.use("/api", require("./routes/room"));
app.use("/api", require("./routes/allocation"));
app.use("/api", require("./routes/students"));
app.use("/api", require("./routes/complaints"));
app.use("/api", require("./routes/notices"));
app.use("/api", require("./routes/payments"));
app.use("/api", require("./routes/mess"));
app.use("/api", require("./routes/reports"));

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);
  res.status(500).json({ error: "Server error" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
