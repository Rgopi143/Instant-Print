import React from 'react';
import { motion } from 'framer-motion';
import { Printer, Sparkles, ArrowRight } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const LandingPage = ({ onStart }) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 text-center max-w-5xl mx-auto">
      
      {/* Company Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <img
          src="/RANBIDGE SOLUTIONS PRIVATE LIMITED.PNG"
          alt="Ranbidge Solutions Private Limited"
          className="h-40 sm:h-56 md:h-72 max-w-full object-contain mx-auto drop-shadow-lg"
        />
      </motion.div>

      {/* Top Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10 mb-6"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>AI-POWERED SELF-SERVICE PRINTER TERMINAL</span>
      </motion.div>

      {/* Main Title Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Instant Printing <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600">
            Zero Waiting Time.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 mb-10">
          Upload PDF, DOCX, or Photos. AI automatically analyzes page count, color distribution, and optimizes print settings for lowest cost.
        </p>
      </motion.div>

      {/* Main Glowing Call-To-Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center justify-center w-full max-w-sm mb-12"
      >
        <button
          onClick={() => {
            audioFX.playButtonClick();
            onStart();
          }}
          className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-5 py-4 sm:px-8 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-violet-600 text-slate-950 font-black text-lg shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 overflow-hidden"
          title="Touch to Start"
          aria-label="Start Kiosk Session"
        >
          <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          <Printer className="w-7 h-7 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
          <span className="hidden sm:inline">TOUCH TO START</span>
          <ArrowRight className="hidden sm:inline-block w-6 h-6 text-slate-950 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

    </div>
  );
};

export default LandingPage;
