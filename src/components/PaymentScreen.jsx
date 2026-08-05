import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle2, ShieldCheck, Sparkles, CreditCard, ArrowRight, Receipt, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateUPIPayload } from '../utils/qrGenerator';
import { audioFX } from '../utils/audioFX';

const PaymentScreen = ({ printJobDetails, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { priceDetails } = printJobDetails;
  const upiPayload = generateUPIPayload({ amount: priceDetails.total });

  const handleSimulatePayment = () => {
    audioFX.playButtonClick();
    setIsProcessing(true);

    setTimeout(() => {
      // Trigger festive confetti explosion
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      audioFX.playSuccessChime();
      setIsProcessing(false);
      onPaymentSuccess();
    }, 1500);
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900">Scan & Pay via UPI / QR</h2>
        <p className="text-xs text-slate-500 mt-1">
          Scan with GPay, PhonePe, Paytm, or any UPI app to authorize instant print job release.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Box: Animated Payment QR Code Canvas */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center justify-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>256-BIT ENCRYPTED SECURE GATEWAY</span>
          </div>

          <div className="relative w-60 h-60 bg-white p-4 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden mb-4">
            {/* SVG QR Code Simulation */}
            <svg viewBox="0 0 200 200" className="w-full h-full text-slate-950">
              <rect width="200" height="200" fill="white" />
              <rect x="10" y="10" width="50" height="50" fill="black" />
              <rect x="20" y="20" width="30" height="30" fill="white" />
              <rect x="25" y="25" width="20" height="20" fill="black" />

              <rect x="140" y="10" width="50" height="50" fill="black" />
              <rect x="150" y="20" width="30" height="30" fill="white" />
              <rect x="155" y="25" width="20" height="20" fill="black" />

              <rect x="10" y="140" width="50" height="50" fill="black" />
              <rect x="20" y="150" width="30" height="30" fill="white" />
              <rect x="25" y="155" width="20" height="20" fill="black" />

              <g fill="#06B6D4">
                <rect x="70" y="20" width="20" height="20" />
                <rect x="100" y="20" width="15" height="15" />
                <rect x="70" y="70" width="25" height="25" />
                <rect x="110" y="70" width="20" height="20" />
                <rect x="140" y="70" width="25" height="20" />
                <rect x="20" y="100" width="20" height="20" />
                <rect x="50" y="100" width="15" height="15" />
                <rect x="80" y="110" width="30" height="20" />
                <rect x="120" y="110" width="20" height="20" />
                <rect x="150" y="100" width="20" height="20" />
                <rect x="70" y="150" width="20" height="20" />
                <rect x="100" y="150" width="30" height="20" />
                <rect x="140" y="140" width="20" height="30" />
              </g>

              {/* Center Rupee symbol */}
              <circle cx="100" cy="100" r="18" fill="#10B981" />
              <text x="100" y="106" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">₹</text>
            </svg>

            {/* Glowing Laser scanner line */}
            <motion.div
              animate={{ y: [0, 210, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-lg shadow-emerald-500/80 pointer-events-none"
            />
          </div>

          <div className="text-2xl font-black text-emerald-600 mb-1">
            ₹{priceDetails.total}
          </div>
          <p className="text-[11px] text-slate-500 font-mono mb-4">Merchant: INSTAPRINT #402</p>

          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-sm shadow-lg shadow-emerald-600/20 hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulate Payment Approval</span>
              </>
            )}
          </button>
        </div>

        {/* Right Box: Itemized Invoice & App badges */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-slate-900 font-bold text-base">
            <Receipt className="w-5 h-5 text-cyan-600" />
            <span>Itemized Receipt Order Breakdown</span>
          </div>

          <div className="space-y-3 text-xs mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Pages:</span>
              <span className="font-semibold text-slate-900">{priceDetails.totalPages} Pages</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Color Mode:</span>
              <span className="font-semibold text-cyan-700 capitalize">{printJobDetails.colorMode}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Paper Type:</span>
              <span className="font-semibold text-slate-800">{printJobDetails.paperSize}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Duplex Mode:</span>
              <span className="font-semibold text-emerald-700">
                {printJobDetails.isDuplex ? "Yes (10% Discount Applied)" : "No"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Quantity / Copies:</span>
              <span className="font-semibold text-slate-900">{priceDetails.copies} Copy</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Final Total Amount:</span>
              <span className="text-emerald-600">₹{priceDetails.total}</span>
            </div>
          </div>

          {/* Supported UPI App Logos */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Supported Apps:</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">GPay</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">PhonePe</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">Paytm</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">BHIM UPI</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">Credit/Debit</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PaymentScreen;
