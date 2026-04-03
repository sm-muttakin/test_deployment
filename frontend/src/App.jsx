// ============================================================
// App.jsx — Root component
// Layout: animated header + two-column grid
//   Left (wider):  live leaderboard
//   Right (sidebar): submission form
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from './components/Leaderboard';
import SubmissionForm from './components/SubmissionForm';

export default function App() {
  // Increment this counter to signal the Leaderboard to refetch immediately
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewSubmission = () => {
    setRefreshTrigger((n) => n + 1);
  };

  return (
    <div className="min-h-screen bg-animated">
      {/* ── Page wrapper ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Animated Header ──────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        glass border border-blue-500/25 text-blue-300
                        text-xs font-semibold uppercase tracking-widest mb-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Real-time Competition
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            <span
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DataArena
            </span>
            {' '}
            <span className="text-slate-100">Leaderboard</span>
          </h1>

          <p className="text-slate-400 mt-3 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Live results auto-sorted by accuracy. Tie-breaker: earliest submission wins.
            Rankings update every <span className="text-blue-400 font-semibold">3 seconds</span>.
          </p>
        </motion.header>

        {/* ── Main two-column layout ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left: Leaderboard panel (takes 2/3 width on lg+) */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8"
            aria-label="Live Leaderboard"
          >
            <Leaderboard refreshTrigger={refreshTrigger} />
          </motion.section>

          {/* Right: Submission form sidebar (takes 1/3 width on lg+) */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="glass rounded-2xl p-6 sm:p-8 lg:sticky lg:top-8"
            aria-label="Submit a new result"
          >
            <SubmissionForm onSubmitSuccess={handleNewSubmission} />
          </motion.aside>
        </div>

        {/* ── Footer ───────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-xs text-slate-700"
        >
          DataArena © {new Date().getFullYear()} — Built with React, Framer Motion, Express & Prisma
        </motion.footer>
      </div>
    </div>
  );
}
