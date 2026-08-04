import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Lock, ArrowRight, UserCheck, CheckCircle2, Bell } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const AuthScreen = ({ onLoginSuccess, onGuestContinue }) => {
  // Step: 'phone' (Default Registration) | 'otp'
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showSmsToast, setShowSmsToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 7) return;
    audioFX.playButtonClick();
    setLoading(true);

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setShowSmsToast(true);
      audioFX.playSuccessChime();
    }, 700);
  };

  const handleAutofillOtp = () => {
    audioFX.playButtonClick();
    if (generatedOtp && generatedOtp.length === 6) {
      setOtp(generatedOtp.split(''));
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance focus to next digit input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    audioFX.playButtonClick();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        phone: "+91 " + phone,
        userType: "Verified Customer",
        walletBalance: "₹250.00",
      });
    }, 700);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8 max-w-md mx-auto">
      
      {/* Simulated Instant Print 24/7 SMS Toast Notification Banner */}
      <AnimatePresence>
        {showSmsToast && generatedOtp && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="w-full mb-4 bg-slate-900 text-white p-4 rounded-2xl border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold mb-0.5">
                  <span>SMS • Instant Print 24/7</span>
                  <span className="text-slate-400">Just Now</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  Your OTP for <span className="font-bold text-white">Instant Print 24/7</span> is <span className="font-mono text-cyan-300 font-extrabold text-sm px-1.5 py-0.5 bg-slate-800 rounded border border-cyan-500/30">{generatedOtp}</span>. Valid for 10 mins.
                </p>

                <button
                  type="button"
                  onClick={handleAutofillOtp}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors shadow-sm active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tap to Auto-fill ({generatedOtp})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 text-center"
      >
        {/* Step 1: Mobile Phone Registration */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-md">
                <Smartphone className="w-7 h-7" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">New Registration</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter your mobile number to receive 6-digit OTP SMS from Instant Print 24/7.
            </p>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-left">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-cyan-600 focus:bg-white text-slate-950 font-medium text-base focus:outline-none transition-all placeholder:text-slate-400"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 7}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Send SMS OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  audioFX.playButtonClick();
                  onGuestContinue();
                }}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium py-1 transition-colors"
              >
                <span>Skip & Print as Guest</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification Input */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shadow-md">
                <Lock className="w-7 h-7" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Enter Verification Code</h2>
            <p className="text-xs text-slate-500 mb-2">
              SMS OTP sent from <span className="font-semibold text-slate-800">Instant Print 24/7</span> to <span className="font-semibold text-slate-800">+91 {phone}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-1.5 sm:gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-10 sm:w-11 h-12 sm:h-13 text-center text-xl font-bold bg-slate-50 border border-slate-300 focus:border-violet-600 focus:bg-white text-slate-950 rounded-xl focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-violet-600/20 hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Verify & Proceed to Upload</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-xs text-cyan-700 hover:text-cyan-800 font-semibold py-1 transition-colors"
              >
                <span>Resend SMS OTP</span>
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default AuthScreen;
