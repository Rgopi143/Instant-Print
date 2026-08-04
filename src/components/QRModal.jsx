import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CheckCircle, Copy, Sparkles, QrCode } from 'lucide-react';
import { generateSessionId, generateMobilePairUrl } from '../utils/qrGenerator';
import { audioFX } from '../utils/audioFX';

const QRModal = ({ isOpen, onClose, onSimulatePair }) => {
  const [sessionId] = useState(generateSessionId());
  const [copied, setCopied] = useState(false);
  const pairUrl = generateMobilePairUrl(sessionId);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pairUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={() => {
              audioFX.playButtonClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-violet-50 border border-violet-200 text-violet-600 mb-3">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Scan QR with Phone</h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload files directly from your mobile browser without entering Wi-Fi passwords.
            </p>
          </div>

          {/* QR Code Canvas Box with Animated Laser Scanner */}
          <div className="relative mx-auto w-64 h-64 bg-white p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center overflow-hidden">
            {/* SVG QR Code Simulation */}
            <svg viewBox="0 0 200 200" className="w-full h-full text-slate-950">
              <rect width="200" height="200" fill="white" />
              {/* Corner position markers */}
              <rect x="10" y="10" width="50" height="50" fill="black" />
              <rect x="20" y="20" width="30" height="30" fill="white" />
              <rect x="25" y="25" width="20" height="20" fill="black" />

              <rect x="140" y="10" width="50" height="50" fill="black" />
              <rect x="150" y="20" width="30" height="30" fill="white" />
              <rect x="155" y="25" width="20" height="20" fill="black" />

              <rect x="10" y="140" width="50" height="50" fill="black" />
              <rect x="20" y="150" width="30" height="30" fill="white" />
              <rect x="25" y="155" width="20" height="20" fill="black" />

              {/* Data pattern squares */}
              <g fill="#0F172A">
                <rect x="70" y="15" width="15" height="15" />
                <rect x="95" y="15" width="15" height="15" />
                <rect x="115" y="30" width="15" height="15" />
                <rect x="70" y="45" width="15" height="15" />
                <rect x="15" y="70" width="15" height="15" />
                <rect x="40" y="70" width="15" height="15" />
                <rect x="70" y="70" width="20" height="20" />
                <rect x="100" y="70" width="15" height="15" />
                <rect x="125" y="70" width="25" height="15" />
                <rect x="160" y="70" width="25" height="20" />
                <rect x="15" y="95" width="15" height="20" />
                <rect x="45" y="100" width="15" height="15" />
                <rect x="75" y="100" width="30" height="15" />
                <rect x="115" y="95" width="20" height="20" />
                <rect x="145" y="100" width="20" height="20" />
                <rect x="70" y="130" width="20" height="20" />
                <rect x="100" y="125" width="25" height="15" />
                <rect x="135" y="130" width="15" height="20" />
                <rect x="70" y="160" width="15" height="25" />
                <rect x="95" y="155" width="20" height="15" />
                <rect x="125" y="160" width="25" height="25" />
                <rect x="160" y="155" width="25" height="25" />
              </g>

              {/* Center Kiosk Icon */}
              <circle cx="100" cy="100" r="18" fill="#8B5CF6" />
              <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">IP</text>
            </svg>

            {/* Laser scanning beam line */}
            <motion.div
              animate={{ y: [0, 220, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-lg shadow-cyan-500/80 pointer-events-none"
            />
          </div>

          {/* Session details */}
          <div className="mt-4 text-center">
            <div className="text-xs text-slate-500 font-mono">
              SESSION ID: <span className="text-cyan-700 font-bold">{sessionId}</span>
            </div>
          </div>

          {/* Simulator button */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                audioFX.playButtonClick();
                onSimulatePair(sessionId);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 hover:opacity-95 transition-opacity active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Mobile Scan & Login</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Link Copied to Clipboard!" : "Copy Sync Link"}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRModal;
