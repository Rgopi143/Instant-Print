import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Palette, FileText, Copy, Layers, CheckCircle2, ArrowRight, DollarSign, Tag, Sparkles } from 'lucide-react';
import { calculatePrintPrice, PRICING_RATES } from '../utils/priceCalculator';
import { audioFX } from '../utils/audioFX';

const PrintConfigForm = ({ documents, onProceedToPayment }) => {
  const totalDocPages = documents.reduce((acc, doc) => acc + doc.estimatedPages, 0);

  // Configuration state
  const [colorMode, setColorMode] = useState('color'); // 'color', 'bw', 'custom'
  const [customColorPages, setCustomColorPages] = useState('1-2');
  const [rangeMode, setRangeMode] = useState('all'); // 'all', 'custom'
  const [pageRangeStr, setPageRangeStr] = useState(`1-${totalDocPages}`);
  const [isDuplex, setIsDuplex] = useState(totalDocPages > 1);
  const [copies, setCopies] = useState(1);
  const [paperSize, setPaperSize] = useState('A4 Standard');

  // Live Price object
  const [priceDetails, setPriceDetails] = useState(() =>
    calculatePrintPrice({
      totalPages: totalDocPages,
      colorMode: 'color',
      customColorPages: '1-2',
      paperSize: 'A4 Standard',
      isDuplex: totalDocPages > 1,
      copies: 1,
    })
  );

  useEffect(() => {
    const updatedPrice = calculatePrintPrice({
      totalPages: totalDocPages,
      colorMode,
      customColorPages,
      paperSize,
      isDuplex,
      copies,
    });
    setPriceDetails(updatedPrice);
  }, [colorMode, customColorPages, paperSize, isDuplex, copies, totalDocPages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    audioFX.playButtonClick();
    onProceedToPayment({
      colorMode,
      customColorPages,
      isDuplex,
      copies,
      paperSize,
      priceDetails,
    });
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900">Custom Print Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure color modes, duplex savings, copies, and paper materials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Config Options Form (2 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* 1. Color Mode Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-600" />
              <span>1. Select Color Mode</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Full Color */}
              <button
                type="button"
                onClick={() => {
                  audioFX.playButtonClick();
                  setColorMode('color');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  colorMode === 'color'
                    ? 'border-cyan-500 bg-cyan-50 text-slate-900 shadow-md shadow-cyan-500/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Full Color</span>
                  <span className="text-xs text-cyan-700 font-mono font-semibold">₹6.00/pg</span>
                </div>
                <p className="text-[11px] text-slate-500">Vivid HD spectrum graphics</p>
              </button>

              {/* Black & White */}
              <button
                type="button"
                onClick={() => {
                  audioFX.playButtonClick();
                  setColorMode('bw');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  colorMode === 'bw'
                    ? 'border-violet-500 bg-violet-50 text-slate-900 shadow-md shadow-violet-500/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Black & White</span>
                  <span className="text-xs text-violet-700 font-mono font-semibold">₹2.00/pg</span>
                </div>
                <p className="text-[11px] text-slate-500">Sharp economical text</p>
              </button>

              {/* Custom Mixed Range */}
              <button
                type="button"
                onClick={() => {
                  audioFX.playButtonClick();
                  setColorMode('custom');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  colorMode === 'custom'
                    ? 'border-emerald-500 bg-emerald-50 text-slate-900 shadow-md shadow-emerald-500/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Custom Mix</span>
                  <span className="text-[10px] text-emerald-800 font-bold px-1.5 py-0.5 rounded bg-emerald-100">HYBRID</span>
                </div>
                <p className="text-[11px] text-slate-500">Color cover, B&W text</p>
              </button>
            </div>

            {/* Custom Range detail input */}
            {colorMode === 'custom' && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Specify Color Page Numbers (e.g. "1-2, 5"):
                </label>
                <input
                  type="text"
                  value={customColorPages}
                  onChange={(e) => setCustomColorPages(e.target.value)}
                  placeholder="1-2, 5"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Pages in range print at Color rate (₹6.00), all remaining pages print at B&W rate (₹2.00).
                </p>
              </div>
            )}
          </div>

          {/* 2. Print Sides & Duplex Discount */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" />
                <span>2. Print Sides</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                10% DUPLEX DISCOUNT
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  audioFX.playButtonClick();
                  setIsDuplex(false);
                }}
                className={`p-4 rounded-xl border text-center transition-all ${
                  !isDuplex
                    ? 'border-cyan-500 bg-cyan-50 text-slate-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-bold text-sm">Single-Sided</div>
                <div className="text-[11px] text-slate-500">1 side per sheet</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioFX.playButtonClick();
                  setIsDuplex(true);
                }}
                className={`p-4 rounded-xl border text-center transition-all ${
                  isDuplex
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-md shadow-emerald-500/10'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-bold text-sm text-emerald-700">Double-Sided (Duplex)</div>
                <div className="text-[11px] text-slate-500">Eco-friendly • 10% Off</div>
              </button>
            </div>
          </div>

          {/* 3. Copies & Paper Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Copies Counter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Copy className="w-4 h-4 text-cyan-600" />
                <span>Copies</span>
              </label>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    audioFX.playButtonClick();
                    setCopies(Math.max(1, copies - 1));
                  }}
                  className="w-10 h-10 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-lg font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="font-mono text-xl font-bold text-slate-900">{copies}</span>
                <button
                  type="button"
                  onClick={() => {
                    audioFX.playButtonClick();
                    setCopies(copies + 1);
                  }}
                  className="w-10 h-10 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-lg font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Paper Size / Material */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-600" />
                <span>Paper Material</span>
              </label>
              <select
                value={paperSize}
                onChange={(e) => {
                  audioFX.playButtonClick();
                  setPaperSize(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:border-cyan-500 focus:bg-white focus:outline-none"
              >
                <option value="A4 Standard">A4 Standard (80 GSM)</option>
                <option value="A3 Large">A3 Heavyweight (+ ₹5.00/pg)</option>
                <option value="4x6 Glossy Photo">4x6 Glossy Photo (+ ₹10.00/pg)</option>
              </select>
            </div>
          </div>

        </form>

        {/* Right Column: Live Price Breakdown Ticker (1 Col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 h-fit sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Price Summary</span>
          </h3>

          <div className="space-y-3 text-xs mb-6">
            <div className="flex justify-between text-slate-600">
              <span>Total Document Pages:</span>
              <span className="font-semibold text-slate-900">{priceDetails.totalPages}</span>
            </div>

            {priceDetails.colorPages > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Color Pages ({priceDetails.colorPages} × ₹6.00):</span>
                <span className="font-semibold text-cyan-600">₹{priceDetails.colorSubtotal}</span>
              </div>
            )}

            {priceDetails.bwPages > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>B&W Pages ({priceDetails.bwPages} × ₹2.00):</span>
                <span className="font-semibold text-violet-600">₹{priceDetails.bwSubtotal}</span>
              </div>
            )}

            {parseFloat(priceDetails.paperSurchargeTotal) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Paper Material Surcharge:</span>
                <span className="font-semibold text-amber-600">+₹{priceDetails.paperSurchargeTotal}</span>
              </div>
            )}

            {parseFloat(priceDetails.duplexSavings) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span>Duplex Discount (10%):</span>
                <span>-₹{priceDetails.duplexSavings}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Copies:</span>
              <span className="font-semibold text-slate-900">× {priceDetails.copies}</span>
            </div>
          </div>

          {/* Grand Total Display */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 mb-6 text-center shadow-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
              ESTIMATED TOTAL COST
            </span>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              ₹{priceDetails.total}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-95 text-white font-black text-base shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default PrintConfigForm;
