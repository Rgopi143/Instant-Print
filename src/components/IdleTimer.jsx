import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const IDLE_WARNING_SECONDS = 50; // Warn after 50s
const IDLE_TOTAL_SECONDS = 60;   // Reset after 60s

const IdleTimer = ({ onReset, isActive = true }) => {
  const [secondsIdle, setSecondsIdle] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setSecondsIdle(0);
      setShowWarning(false);
      return;
    }

    const resetTimer = () => {
      setSecondsIdle(0);
      setShowWarning(false);
    };

    // User activity listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    const interval = setInterval(() => {
      setSecondsIdle((prev) => {
        const next = prev + 1;
        if (next >= IDLE_WARNING_SECONDS && next < IDLE_TOTAL_SECONDS) {
          setShowWarning(true);
          audioFX.playWarningBeep();
        } else if (next >= IDLE_TOTAL_SECONDS) {
          clearInterval(interval);
          setShowWarning(false);
          onReset();
        }
        return next;
      });
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      clearInterval(interval);
    };
  }, [isActive, onReset]);

  if (!showWarning) return null;

  const countdownRemaining = IDLE_TOTAL_SECONDS - secondsIdle;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm bg-white border border-amber-300 rounded-3xl p-6 text-center shadow-2xl shadow-amber-500/10 text-slate-900"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-1">Are you still there?</h3>
          <p className="text-xs text-slate-500 mb-6">
            To protect your privacy, your session will reset to landing page in:
          </p>

          {/* Large Countdown Ring Number */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-slate-50 border-4 border-amber-500 text-amber-600 font-black text-4xl shadow-inner">
            <span>{countdownRemaining}s</span>
          </div>

          <button
            onClick={() => {
              audioFX.playButtonClick();
              setSecondsIdle(0);
              setShowWarning(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>I'm Still Here! (Extend Session)</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IdleTimer;
