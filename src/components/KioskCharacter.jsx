import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, Volume2, EyeOff, Sparkles, MessageSquare } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const SPEECH_MESSAGES = [
  "Hey! I'm talking on the phone & sending my PDF directly to print! 📱",
  "Zero waiting time! Tap TOUCH TO START or scan QR code ⚡",
  "Catch me if you can! Tap me to hide or peek! 🙈",
  "AI color detection is awesome... saves so much money! 💡",
  "Fastest self-service printing! 🚀"
];

const KioskCharacter = () => {
  // States: 'talking' (roaming & phone calling) | 'hiding' (peek from bottom corner) | 'waving'
  const [characterState, setCharacterState] = useState('talking');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTalkingOnPhone, setIsTalkingOnPhone] = useState(true);
  const [roamDirection, setRoamDirection] = useState(1);

  // Auto-switch speech bubble & periodic hide & seek peek
  useEffect(() => {
    const dialogInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SPEECH_MESSAGES.length);
    }, 4500);

    const hideSeekInterval = setInterval(() => {
      // Periodically trigger a peek / hide maneuver
      setCharacterState((prev) => (prev === 'talking' ? 'hiding' : 'talking'));
    }, 9000);

    return () => {
      clearInterval(dialogInterval);
      clearInterval(hideSeekInterval);
    };
  }, []);

  const handleCharacterClick = () => {
    audioFX.playButtonClick();
    if (characterState === 'hiding') {
      setCharacterState('talking');
    } else {
      setCharacterState('hiding');
    }
    setMessageIndex((prev) => (prev + 1) % SPEECH_MESSAGES.length);
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-8 z-30 select-none pointer-events-auto">
      
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {characterState !== 'hiding' && (
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute -top-24 right-0 sm:right-6 w-64 sm:w-72 bg-slate-900/95 text-slate-100 p-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 backdrop-blur-md text-xs font-medium cursor-pointer"
            onClick={handleCharacterClick}
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                <MessageSquare className="w-4 h-4 animate-bounce" />
              </div>
              <p className="leading-snug text-slate-200">
                {SPEECH_MESSAGES[messageIndex]}
              </p>
            </div>

            {/* Speech Bubble Arrow Tail */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-900/95 border-b border-r border-cyan-500/40 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Character Avatar Wrapper */}
      <motion.div
        animate={
          characterState === 'hiding'
            ? { y: 110, opacity: 0.85 }
            : { y: [0, -6, 0], opacity: 1 }
        }
        transition={
          characterState === 'hiding'
            ? { duration: 0.6, ease: 'easeInOut' }
            : { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
        }
        onClick={handleCharacterClick}
        className="relative group cursor-pointer flex flex-col items-center"
        title="Click me to Hide & Seek or talk!"
      >
        {/* Status Indicator Badge */}
        <div className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-violet-500/40 text-[10px] text-cyan-300 font-semibold shadow-md backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{characterState === 'hiding' ? 'PEEKING 🙈' : 'ON PHONE 📞'}</span>
        </div>

        {/* Vector SVG Character: Modern Animated Man with Phone & Headphones */}
        <div className="relative w-28 h-36 sm:w-32 sm:h-40 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
          
          <svg viewBox="0 0 160 200" className="w-full h-full drop-shadow-xl">
            
            {/* Soft Shadow Base */}
            <ellipse cx="80" cy="190" rx="45" ry="8" fill="rgba(0,0,0,0.25)" />

            {/* Legs & Shoes */}
            <motion.g
              animate={{ rotate: characterState === 'hiding' ? 0 : [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              {/* Left Leg */}
              <rect x="55" y="130" width="18" height="50" rx="9" fill="#1E293B" />
              <rect x="50" y="172" width="26" height="14" rx="7" fill="#0284C7" />
              
              {/* Right Leg */}
              <rect x="87" y="130" width="18" height="50" rx="9" fill="#1E293B" />
              <rect x="84" y="172" width="26" height="14" rx="7" fill="#0284C7" />
            </motion.g>

            {/* Torso / Jacket */}
            <path d="M 40 85 L 120 85 C 125 85 130 95 125 135 L 35 135 C 30 95 35 85 40 85 Z" fill="#0284C7" />
            {/* Inner Hoodie / Shirt */}
            <path d="M 65 85 L 95 85 L 90 135 L 70 135 Z" fill="#8B5CF6" />
            
            {/* Left Arm (Relaxed / Gesture) */}
            <motion.path
              d="M 35 90 Q 20 110 30 130"
              stroke="#0284C7"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />

            {/* Right Arm (Holding Phone to Ear) */}
            <motion.path
              d="M 120 90 Q 145 95 118 68"
              stroke="#0284C7"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hand holding phone */}
            <circle cx="116" cy="65" r="9" fill="#FDBA74" />

            {/* Smartphone Device at Ear */}
            <motion.g
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <rect x="114" y="45" width="18" height="32" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
              <rect x="117" y="48" width="12" height="22" rx="2" fill="#38BDF8" />
              {/* Phone Signal / Calling Waves */}
              <circle cx="136" cy="50" r="4" fill="none" stroke="#38BDF8" strokeWidth="1.5" className="animate-ping" />
            </motion.g>

            {/* Head & Neck */}
            <rect x="70" y="70" width="20" height="20" fill="#FDBA74" />
            
            {/* Head Circle */}
            <circle cx="80" cy="50" r="28" fill="#FDBA74" />
            
            {/* Cool Hair Style */}
            <path d="M 52 48 Q 50 20 80 20 Q 110 20 108 48 Q 95 30 80 32 Q 65 30 52 48 Z" fill="#1E1B4B" />

            {/* Smart Glasses / Shades */}
            <rect x="62" y="44" width="16" height="12" rx="3" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
            <rect x="82" y="44" width="16" height="12" rx="3" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
            <line x1="78" y1="48" x2="82" y2="48" stroke="#0F172A" strokeWidth="2" />

            {/* Friendly Smile */}
            <path d="M 72 62 Q 80 68 88 62" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          </svg>
        </div>

        {/* Peek / Hide Action Hint Pill */}
        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] text-cyan-300 bg-slate-900/90 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium">
          {characterState === 'hiding' ? 'Tap to Peek Up! ⬆️' : 'Tap to Hide! 🙈'}
        </div>
      </motion.div>

    </div>
  );
};

export default KioskCharacter;
