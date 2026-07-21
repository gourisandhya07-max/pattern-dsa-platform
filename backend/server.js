const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "users.json");

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("failed to read users.json", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("failed to write users.json", err);
  }
}

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.json({ success: false, message: "Username and password required" });
  }

  const users = readUsers();
  if (users.some((user) => user.username === username)) {
    return res.json({ success: false, message: "User already exists" });
  }

  const newUser = { username, password, progress: 0 };
  users.push(newUser);
  writeUsers(users);
  return res.json({ success: true, user: newUser });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.json({ success: false, message: "Username and password required" });
  }

  const users = readUsers();
  const user = users.find((entry) => entry.username === username && entry.password === password);
  if (!user) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  return res.json({ success: true, user });
});

app.post("/updateProgress", (req, res) => {
  const { username, progress } = req.body || {};
  if (!username || typeof progress !== "number") {
    return res.json({ success: false, message: "Username and numeric progress required" });
  }

  const users = readUsers();
  const user = users.find((entry) => entry.username === username);
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

const currentProgress = Number(user.progress) || 0;
const nextProgress = Math.max(0, Math.min(100, progress));

if (currentProgress === nextProgress) {
  return res.json({ success: true, user });
}

user.progress = nextProgress;
writeUsers(users);
return res.json({ success: true, user });
});

app.get("/leaderboard", (req, res) => {
  const users = readUsers();
  const sorted = users.slice().sort((a, b) => b.progress - a.progress);
  res.json(sorted.map(({ username, progress }) => ({ username, progress })));
});

app.get("/users", (req, res) => {
  res.json(readUsers());
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});