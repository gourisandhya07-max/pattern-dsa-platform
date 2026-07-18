# DSA Pattern Hub

This repository contains a full-stack educational platform for learning data structures & algorithms patterns.

## Overview
The project started as a static site but has been upgraded with a Node.js/Express backend, authentication, progress tracking, and a leaderboard system.

## Backend
Located in the `backend/` folder. It uses a simple JSON file (`users.json`) to store users and their progress for demo purposes.

### Running the backend
```bash
cd backend
npm install   # installs express, cors, body-parser
npm start     # starts server on http://localhost:5500
```

Available API endpoints:
- `POST /register` — accepts JSON `{ username, password }`
- `POST /login` — accepts JSON `{ username, password }`
- `POST /updateProgress` — accepts JSON `{ username, progress }`
- `GET /leaderboard` — returns sorted list of users by progress

> **Note:** Passwords are stored in plain text for demonstration. A real application should hash passwords (e.g. with bcrypt).

## Frontend
Static HTML/CSS/JavaScript files in the root folder. Key pages:
- `login.html` — authentication form
- `index.html` — home page
- `patterns.html` & `pattern-detail.html` — pattern browser
- `practice.html` — in-browser Python editor
- `leaderboard.html` — shows user ranking

The shared `script.js` handles dark mode, navigation, authentication guard, and API calls.

## Authentication Guard
All pages (except `login.html`) redirect to the login screen if no username is present in `localStorage`. Upon successful login/registration, the username is stored in `localStorage`.

## Progress Tracking & Leaderboard
Page visits trigger progress updates to the backend. The leaderboard page fetches and displays sorted progress values.

## Development Notes
- For quick testing, run backend locally and open frontend pages in the browser (served via file:// or a simple HTTP server).
- The backend uses port 5500 by default; adjust `apiBase` in `script.js` if changed.

## License
MIT
# 🚀 DSA Pattern Hub (Full-Stack)

A full-stack DSA learning platform with authentication, progress tracking, and leaderboard system.

---

## 🛠 How to Run This Project Locally

### 1️⃣ Clone the repository
git clone <your-repo-link>

### 2️⃣ Go into project folder
cd pattern-dsa-platform

### 3️⃣ Install backend dependencies
cd backend
npm install

### 4️⃣ Start backend server
node server.js

You should see:
Backend server listening on port 5500

### 5️⃣ Open frontend
Go back to main folder and open:
login.html
(or use Live Server)

---

## ⚙ Backend runs on:
http://localhost:5500