import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, CheckCircle, Download, RefreshCw, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const PrintAnimation = ({ printJobDetails, onFinish }) => {
  const totalPages = printJobDetails.priceDetails.totalPages * printJobDetails.priceDetails.copies;
  const [currentPage, setCurrentPage] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    if (currentPage <= totalPages) {
      // Play stepper motor roller pulse sound
      audioFX.playPrinterRollerPulse();

      const timer = setTimeout(() => {
        if (currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        } else {
          audioFX.playPageEject();
          setIsComplete(true);
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [currentPage, totalPages]);

  // Automatic redirect back to dashboard after print completion
  useEffect(() => {
    if (!isComplete) return;

    if (redirectCountdown <= 0) {
      onFinish();
      return;
    }

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, redirectCountdown, onFinish]);

  const progressPercent = Math.min(100, Math.round((currentPage / totalPages) * 100));

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-8 text-center">
      
      {!isComplete ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Printing in Progress</h2>
          <p className="text-xs text-cyan-600 font-mono font-semibold mb-8 animate-pulse">
            HIGH SPEED LASER PRINTHEAD ACTIVE • DO NOT TOUCH OUTPUT TRAY
          </p>

          {/* Printer Mechanical Hardware Animation Canvas / Visualizer */}
          <div className="relative mx-auto w-64 h-72 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner mb-6">
            
            {/* Top Paper Feeding Slot */}
            <div className="w-52 h-4 bg-slate-900 border-b-2 border-cyan-500/50 rounded-t-lg z-20 flex items-center justify-center">
              <div className="w-20 h-1 bg-cyan-400 rounded-full animate-ping"></div>
            </div>

            {/* Paper Sheet Feeding Down Animation */}
            <div className="relative w-48 h-52 bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden flex flex-col justify-between p-3">
              
              {/* Paper Content Preview Lines */}
              <div className="space-y-2">
                <div className="h-3 w-2/3 bg-cyan-500/40 rounded"></div>
                <div className="h-2 w-full bg-slate-700/60 rounded"></div>
                <div className="h-2 w-5/6 bg-slate-700/60 rounded"></div>
                <div className="h-2 w-4/5 bg-slate-700/60 rounded"></div>
                <div className="h-10 w-full bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 rounded border border-slate-700"></div>
                <div className="h-2 w-full bg-slate-700/60 rounded"></div>
              </div>

              {/* Scanning Laser Beam across Page */}
              <motion.div
                animate={{ y: [0, 180, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 shadow-lg shadow-cyan-400/80"
              />

              {/* Watermark Page Number */}
              <div className="text-right text-[10px] font-mono text-slate-400">
                PAGE {currentPage} / {totalPages}
              </div>
            </div>

            {/* Bottom Mechanical Rollers */}
            <div className="w-52 h-6 bg-slate-900 border-t-2 border-slate-800 rounded-b-lg z-20 flex items-center justify-around px-4">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
              <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin"></div>
            </div>

          </div>

          {/* Live Progress Bar & Page Counter */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs text-slate-700 font-bold mb-2">
              <span>Printing Page {currentPage} of {totalPages}</span>
              <span className="text-cyan-600 font-mono">{progressPercent}%</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-cyan-600 via-violet-600 to-emerald-500 rounded-full"
              />
            </div>
          </div>

        </div>
      ) : (
        /* Print Completion Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Print Job Completed!</h2>
          <p className="text-sm text-slate-600 mb-4">
            Please collect your <span className="text-emerald-700 font-bold">{totalPages} page(s)</span> from the output tray below.
          </p>

          {/* Automatic Redirect Countdown Badge */}
          <div className="mb-6 inline-flex flex-col items-center">
            <span className="px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-xs flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
              Returning to Dashboard automatically in {redirectCountdown}s...
            </span>
            <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200">
              <div 
                className="bg-cyan-500 h-full transition-all duration-1000" 
                style={{ width: `${(redirectCountdown / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Receipt Download Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto mb-8 text-xs text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span>Order Reference:</span>
              <span className="font-mono text-cyan-700 font-bold">ORD-2026-8942</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-bold text-slate-900">₹{printJobDetails.priceDetails.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Status:</span>
              <span className="text-emerald-700 font-semibold">Files Are Stored in Your Profile</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                audioFX.playButtonClick();
                alert("Digital Receipt generated & sent to mobile device.");
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-600" />
              <span>Download Digital Receipt</span>
            </button>

            <button
              onClick={() => {
                audioFX.playButtonClick();
                onFinish();
              }}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 hover:opacity-95 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Done & Finish Session</span>
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default PrintAnimation;
