// ============================================================
// prisma/seed.js — Seed the database with demo data
// Run with: npm run db:seed
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedData = [
  { teamName: "Alpha Wolves",    accuracyScore: 97.5 },
  { teamName: "Neural Ninjas",   accuracyScore: 95.2 },
  { teamName: "Data Dragons",    accuracyScore: 95.2 }, // Tied score — tie-break by time
  { teamName: "Byte Bandits",    accuracyScore: 91.8 },
  { teamName: "Quantum Coders",  accuracyScore: 88.4 },
  { teamName: "Pixel Pirates",   accuracyScore: 85.0 },
  { teamName: "Logic Lords",     accuracyScore: 79.3 },
  { teamName: "Model Mavericks", accuracyScore: 74.1 },
];

async function main() {
  console.log("🌱 Seeding leaderboard submissions...");
  // Clear existing data before seeding
  await prisma.submission.deleteMany({});

  for (const entry of seedData) {
    const submission = await prisma.submission.create({ data: entry });
    console.log(`  ✅ Created: ${submission.teamName} (${submission.accuracyScore}%)`);
  }

  console.log("\n✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
