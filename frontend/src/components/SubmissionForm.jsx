// ============================================================
// SubmissionForm.jsx
// Sidebar form to POST a new leaderboard submission.
// - Validates input before sending
// - Shows inline success / error feedback
// - Calls onSubmitSuccess() after a successful POST so the
//   parent can trigger an immediate leaderboard refresh.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// ── Preset teams for quick demo ───────────────────────────────
const PRESET_TEAMS = [
  'Alpha Wolves', 'Neural Ninjas', 'Byte Bandits',
  'Data Dragons', 'Pixel Pirates', 'Quantum Coders',
  'Model Mavericks', 'Logic Lords',
];

export default function SubmissionForm({ onSubmitSuccess }) {
  const [teamName, setTeamName]       = useState('');
  const [score, setScore]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [feedback, setFeedback]       = useState(null); // { type: 'success'|'error', msg }
  const timeoutRef                    = useRef(null);

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Basic client-side validation
    const trimmedName = teamName.trim();
    if (!trimmedName) {
      setFeedback({ type: 'error', msg: 'Team name cannot be empty.' });
      return;
    }
    const parsedScore = parseFloat(score);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      setFeedback({ type: 'error', msg: 'Score must be a number between 0 and 100.' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://test-deployment-bkw1.onrender.com/api/submissions', {
        teamName: trimmedName,
        accuracyScore: parsedScore,
      });
      setFeedback({ type: 'success', msg: `✅ "${trimmedName}" submitted with ${parsedScore.toFixed(2)}%!` });
      setTeamName('');
      setScore('');
      // Notify parent to trigger an immediate leaderboard refresh
      if (onSubmitSuccess) onSubmitSuccess();
      
      // Clear previous timeout and set new one
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      setFeedback({ type: 'error', msg: serverMsg || 'Submission failed. Is the server running?' });
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill with a random score for the selected preset
  const applyPreset = (name) => {
    setTeamName(name);
    setScore((Math.random() * 30 + 70).toFixed(2)); // Random 70–100
    setFeedback(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📤</span> New Submission
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Submit a result to update the live leaderboard instantly
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Team Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Team Name
          </label>
          <input
            id="team-name-input"
            type="text"
            className="form-input"
            placeholder="e.g. Quantum Coders"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={loading}
            maxLength={60}
          />
        </div>

        {/* Accuracy Score */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Accuracy Score (0 – 100)
          </label>
          <input
            id="accuracy-score-input"
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="form-input font-mono"
            placeholder="e.g. 93.75"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Submit button */}
        <button
          id="submit-btn"
          type="submit"
          className="btn-submit mt-1"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </span>
          ) : (
            '🚀  Submit to Leaderboard'
          )}
        </button>
      </form>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className={`
              rounded-xl px-4 py-3 text-sm font-medium
              ${feedback.type === 'success'
                ? 'bg-green-500/15 border border-green-500/30 text-green-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }
            `}
          >
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-xs text-slate-600 uppercase tracking-widest">Quick Fill</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Preset team chips */}
      <div>
        <p className="text-xs text-slate-500 mb-2.5">
          Click a team to auto-fill with a random score:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_TEAMS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => applyPreset(name)}
              disabled={loading}
              className="
                text-xs px-3 py-1.5 rounded-full glass border border-white/10
                text-slate-300 hover:text-white hover:border-blue-400/50
                hover:bg-blue-500/10 transition-all duration-200 disabled:opacity-40
                cursor-pointer
              "
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="glass-darker rounded-xl p-4 mt-auto">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="text-slate-300 font-semibold">How ranking works:</span>
          <br />
          Submissions are ranked by <span className="text-blue-400">accuracy score (highest first)</span>.
          Tied scores are broken by <span className="text-purple-400">submission time (earliest wins)</span>.
        </p>
      </div>
    </div>
  );
}
