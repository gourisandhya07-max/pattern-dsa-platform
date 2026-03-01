const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let users = [];

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/register", (req, res) => {
  const { username } = req.body;
  users.push({ username, progress: 0 });
  res.json({ message: "User registered" });
});

app.get("/leaderboard", (req, res) => {
  res.json(users.sort((a, b) => b.progress - a.progress));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});