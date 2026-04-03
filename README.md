# 🏆 DataArena — Dynamic Leaderboard

A real-time, auto-sorting leaderboard for a Data Science competition platform, built with:

- **Frontend**: React (Vite) · Tailwind CSS · Framer Motion · Axios  
- **Backend**: Node.js · Express.js · Prisma ORM  
- **Database**: PostgreSQL

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| PostgreSQL | ≥ 14 |

---

## 🚀 Quick Start

### 1. Set up the Database

Create a PostgreSQL database:

```sql
CREATE DATABASE leaderboard_db;
```

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and replace the placeholder with your real credentials:

```
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/leaderboard_db?schema=public"
PORT=5000
```

### 3. Install & Run the Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init   # Create tables
npm run db:seed                       # Seed with demo data (optional)
npm run dev                           # Start the API server
```

API will be live at **http://localhost:5000**

### 4. Install & Run the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

App will open at **http://localhost:5173**

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Fetch all submissions (sorted by score ↓, time ↑) |
| `POST` | `/api/submissions` | Add a new submission |

**POST body:**
```json
{
  "teamName": "Alpha Wolves",
  "accuracyScore": 97.5
}
```

---

## ✨ Features

- **Real-time polling** — Leaderboard refreshes every **3 seconds**  
- **Smooth animations** — Framer Motion `layout` prop enables fluid row reordering  
- **Medal glows** — Top 3 rows get Gold 🥇 / Silver 🥈 / Bronze 🥉 glow effects  
- **NEW badge** — Fresh submissions are highlighted briefly  
- **Tie-breaking** — Equal scores are broken by earliest submission time  
- **Quick-fill presets** — Sidebar chips let you demo new submissions instantly  

---

## 📁 Project Structure

```
ISD/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Submission model
│   │   └── seed.js            # Demo data seeder
│   ├── server.js              # Express API server
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Leaderboard.jsx    # Live leaderboard + animations
    │   │   └── SubmissionForm.jsx # New submission sidebar
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css              # Glassmorphism + Tailwind
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```
