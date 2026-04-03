// ============================================================
// Leaderboard.jsx
// Real-time leaderboard with Framer Motion animations.
// - Polls GET /api/leaderboard every 3 seconds
// - Top 3 rows get Gold / Silver / Bronze glows
// - AnimatePresence + layout prop enable smooth row reordering
// ============================================================

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// ── Medal config ─────────────────────────────────────────────
const MEDALS = [
  {
    emoji: '🥇',
    label: 'GOLD',
    glowClass: 'glow-gold',
    badgeBg: 'bg-yellow-400/15',
    badgeText: 'text-yellow-300',
    barColor: 'linear-gradient(90deg, #FFD700, #FFA500)',
    rankBg: 'bg-yellow-400/20',
    rankText: 'text-yellow-300',
  },
  {
    emoji: '🥈',
    label: 'SILVER',
    glowClass: 'glow-silver',
    badgeBg: 'bg-slate-300/15',
    badgeText: 'text-slate-300',
    barColor: 'linear-gradient(90deg, #C0C0C0, #A0A0A0)',
    rankBg: 'bg-slate-400/20',
    rankText: 'text-slate-300',
  },
  {
    emoji: '🥉',
    label: 'BRONZE',
    glowClass: 'glow-bronze',
    badgeBg: 'bg-orange-400/15',
    badgeText: 'text-orange-300',
    barColor: 'linear-gradient(90deg, #CD7F32, #B8652A)',
    rankBg: 'bg-orange-400/20',
    rankText: 'text-orange-300',
  },
];

// ── Utility: format time ─────────────────────────────────────
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ── Leaderboard Row ───────────────────────────────────────────
function LeaderboardRow({ submission, rank, isNew }) {
  const isTop3 = rank <= 3;
  const medal = isTop3 ? MEDALS[rank - 1] : null;

  return (
    <motion.div
      // "layout" tells Framer Motion to smoothly animate position changes
      layout
      layoutId={submission.id}
      initial={{ opacity: 0, x: -30, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        scale:   { duration: 0.25 },
      }}
      className={`
        glass rounded-xl p-4 flex items-center gap-4 relative overflow-hidden
        transition-all duration-300
        ${medal ? medal.glowClass : 'hover:border-white/15'}
        ${isNew ? 'ring-1 ring-blue-400/60' : ''}
      `}
    >
      {/* Subtle shimmer highlight for top 3 */}
      {isTop3 && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: rank === 1
                ? 'linear-gradient(135deg, #FFD700 0%, transparent 60%)'
                : rank === 2
                ? 'linear-gradient(135deg, #C0C0C0 0%, transparent 60%)'
                : 'linear-gradient(135deg, #CD7F32 0%, transparent 60%)',
            }}
          />
        </div>
      )}

      {/* Rank badge */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
          font-bold text-sm font-mono
          ${medal ? `${medal.rankBg} ${medal.rankText}` : 'bg-white/5 text-slate-400'}
        `}
      >
        {isTop3 ? medal.emoji : `#${rank}`}
      </div>

      {/* Team info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-semibold text-sm text-slate-100 truncate">
            {submission.teamName}
          </span>
          {isTop3 && (
            <span
              className={`
                text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest
                ${medal.badgeBg} ${medal.badgeText}
              `}
            >
              {medal.label}
            </span>
          )}
          {isNew && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest bg-blue-500/20 text-blue-300 animate-pulse">
              NEW
            </span>
          )}
        </div>

        {/* Score progress bar */}
        <div className="score-bar-track">
          <motion.div
            className="score-bar-fill"
            style={{
              background: medal ? medal.barColor : undefined,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${submission.accuracyScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
      </div>

      {/* Score + time */}
      <div className="flex-shrink-0 text-right">
        <div
          className={`text-lg font-black font-mono ${
            medal ? medal.rankText : 'text-slate-200'
          }`}
        >
          {submission.accuracyScore.toFixed(2)}
          <span className="text-xs font-normal text-slate-500 ml-0.5">%</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
          {formatTime(submission.submissionTime)}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Leaderboard Component ────────────────────────────────
export default function Leaderboard({ refreshTrigger }) {
  const [submissions, setSubmissions]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [newIds, setNewIds]             = useState(new Set());
  const prevIdsRef                      = useRef(new Set());
  const newIdsTimeoutRef                = useRef(null);
  const POLL_INTERVAL_MS                = 3000; // 3 seconds

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (newIdsTimeoutRef.current) clearTimeout(newIdsTimeoutRef.current);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get('https://test-deployment-bkw1.onrender.com/api/leaderboard');
      
      // Detect genuinely new submissions to show "NEW" badge
      const incoming = new Set(data.map((s) => s.id));
      const fresh    = [...incoming].filter((id) => !prevIdsRef.current.has(id));
      if (fresh.length > 0) {
        setNewIds(new Set(fresh));
        if (newIdsTimeoutRef.current) clearTimeout(newIdsTimeoutRef.current);
        newIdsTimeoutRef.current = setTimeout(() => setNewIds(new Set()), 4000);
      }
      prevIdsRef.current = incoming;

      setSubmissions(data);
      setLastUpdated(new Date());
      setError(null);
      return true; // Success flag for polling
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Unable to reach the server. Retrying…');
      return false; // Error flag for polling
    } finally {
      setLoading(false);
    }
  };

  // Poll with exponential backoff on error
  useEffect(() => {
    let timeoutId;
    let isCancelled = false;
    let currentStreak = 0; // Track consecutive errors

    const poll = async () => {
      if (isCancelled) return;
      
      const success = await fetchLeaderboard();
      if (isCancelled) return;

      if (success) {
        currentStreak = 0;
      } else {
        currentStreak++;
      }

      // Base interval: 3s. Double interval on failure (capped at 30s max)
      const nextInterval = currentStreak > 0 
        ? Math.min(POLL_INTERVAL_MS * Math.pow(2, Math.min(currentStreak, 4)), 30000)
        : POLL_INTERVAL_MS;

      timeoutId = setTimeout(poll, nextInterval);
    };

    poll(); // Start polling loop

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Also refetch immediately whenever a new submission is made via the form
  useEffect(() => {
    if (refreshTrigger > 0) fetchLeaderboard();
  }, [refreshTrigger]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏆</span> Live Rankings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Updates every 3s • Sorted by score ↓, then time ↑
          </p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs text-green-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-[11px] text-slate-600 mb-4 font-mono">
          Last synced: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* States */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading leaderboard…</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="glass rounded-xl p-4 border-red-500/30 bg-red-500/5 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && submissions.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          No submissions yet. Add one using the form! 👉
        </div>
      )}

      {/* Leaderboard rows */}
      {!loading && !error && submissions.length > 0 && (
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1" style={{ maxHeight: '65vh' }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {submissions.map((submission, index) => (
              <LeaderboardRow
                key={submission.id}
                submission={submission}
                rank={index + 1}
                isNew={newIds.has(submission.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Entry count footer */}
      {submissions.length > 0 && (
        <p className="text-[11px] text-slate-600 mt-4 text-right font-mono">
          {submissions.length} team{submissions.length !== 1 ? 's' : ''} competing
        </p>
      )}
    </div>
  );
}
