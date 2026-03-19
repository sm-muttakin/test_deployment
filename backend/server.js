// ============================================================
// server.js — Dynamic Leaderboard API
// Express + Prisma + PostgreSQL
// ============================================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables from .env
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------------
// Middleware
// ----------------------------------------------------------
app.use(cors()); // Allow all cross-origin requests (dev-friendly)
app.use(express.json()); // Parse JSON request bodies

// ----------------------------------------------------------
// Health Check
// ----------------------------------------------------------
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Leaderboard API is running 🚀" });
});

// ----------------------------------------------------------
// Route 1: GET /api/leaderboard
// Returns all submissions ordered by:
//   1. accuracyScore DESC  (highest score first)
//   2. submissionTime ASC  (earliest submission wins ties)
// ----------------------------------------------------------
app.get("/api/leaderboard", async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: [
        { accuracyScore: "desc" }, // Primary sort: highest score wins
        { submissionTime: "asc" }, // Tie-breaker: earliest time wins
      ],
    });
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard data." });
  }
});

// ----------------------------------------------------------
// Route 2: POST /api/submissions
// Body: { teamName: string, accuracyScore: number }
// Creates or updates a submission entry (Case-insensitive Upsert)
// ----------------------------------------------------------
app.post("/api/submissions", async (req, res) => {
  const { teamName, accuracyScore } = req.body;

  // --- Validation ---
  if (!teamName || typeof teamName !== "string" || teamName.trim() === "") {
    return res.status(400).json({ error: "teamName is required and must be a non-empty string." });
  }

  const score = parseFloat(accuracyScore);
  if (isNaN(score) || score < 0 || score > 100) {
    return res
      .status(400)
      .json({ error: "accuracyScore must be a number between 0 and 100." });
  }

  const normalizedTeamName = teamName.trim();

  try {
    // 1. Check if team already exists (case-insensitive lookup)
    const existing = await prisma.submission.findFirst({
      where: {
        teamName: {
          equals: normalizedTeamName,
          mode: "insensitive", // Matches "BLUe" with "blue"
        },
      },
    });

    if (existing) {
      // 2a. Update ONLY IF the new score is strictly strictly higher
      if (score > existing.accuracyScore) {
        const updated = await prisma.submission.update({
          where: { id: existing.id },
          data: {
            accuracyScore: score,
            submissionTime: new Date(), // Reset time to now for the tie-breaker
            teamName: normalizedTeamName, // Optionally update to latest casing
          },
        });
        return res.status(200).json(updated);
      } else {
        // Score was not improved, return the existing row without modifications
        return res.status(200).json({
          message: "Score was not higher than existing record, ignored.",
          data: existing,
        });
      }
    } else {
      // 2b. Create new submission
      const newSubmission = await prisma.submission.create({
        data: {
          teamName: normalizedTeamName,
          accuracyScore: score,
        },
      });
      return res.status(201).json(newSubmission);
    }
  } catch (error) {
    console.error("Error creating/updating submission:", error);
    res.status(500).json({ error: "Failed to create/update submission." });
  }
});

// ----------------------------------------------------------
// Start Server
// ----------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 Leaderboard API running at http://localhost:${PORT}`);
  console.log(`   GET  /api/leaderboard`);
  console.log(`   POST /api/submissions\n`);
});

// Graceful shutdown — close Prisma connection on exit
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
