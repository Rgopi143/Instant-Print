import React, { useState, useEffect } from 'react';
import { Printer, Wifi, Clock, Smartphone, Monitor, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const KioskHeader = ({ isMobileMode, toggleViewMode, onResetSession, currentStep }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative z-20 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-200 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Kiosk ID */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wider text-white">
                INSTA <span className="text-cyan-400">PRINT</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                READY
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Terminal #402</span>
              <span>•</span>
              <span>Express Kiosk</span>
            </p>
          </div>
        </div>

        {/* Hardware Status Bar Gauges */}
        <div className="hidden md:flex items-center gap-6 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/80 text-xs">
          
          {/* Paper Level */}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="flex justify-between gap-2 text-[10px] text-slate-400">
                <span>PAPER TRAY</span>
                <span className="text-cyan-300 font-semibold">450 / 500</span>
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full w-[90%]"></div>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          {/* Ink CMYK Levels */}
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-4 gap-1 w-16">
              <div className="h-3 bg-cyan-400 rounded-xs shadow-sm shadow-cyan-400/50" title="Cyan 92%"></div>
              <div className="h-3 bg-fuchsia-500 rounded-xs shadow-sm shadow-fuchsia-500/50" title="Magenta 88%"></div>
              <div className="h-3 bg-amber-400 rounded-xs shadow-sm shadow-amber-400/50" title="Yellow 95%"></div>
              <div className="h-3 bg-slate-100 rounded-xs shadow-sm shadow-slate-100/50" title="Key Black 98%"></div>
            </div>
            <div className="text-[10px]">
              <div className="text-slate-400">INK CMYK</div>
              <div className="text-emerald-400 font-medium">95% avg</div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          {/* Network & Latency */}
          <div className="flex items-center gap-2 text-slate-400">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400">5G MESH</div>
              <div className="text-slate-300 text-[10px]">14ms latency</div>
            </div>
          </div>
        </div>

        {/* Live Clock & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">{time.toLocaleTimeString()}</span>
          </div>

          {/* View Mode Toggle: Kiosk vs Mobile Companion */}
          <button
            onClick={() => {
              audioFX.playButtonClick();
              toggleViewMode();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all shadow-sm active:scale-95"
            title="Toggle between Kiosk Display and Mobile Companion mode"
          >
            {isMobileMode ? (
              <>
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Switch to Kiosk View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-violet-400" />
                <span className="hidden sm:inline">Mobile Mode</span>
              </>
            )}
          </button>

          {/* Reset Session button if in active process */}
          {currentStep !== 'landing' && (
            <button
              onClick={() => {
                audioFX.playButtonClick();
                onResetSession();
              }}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all active:scale-95"
              title="Reset Kiosk Session"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default KioskHeader;
