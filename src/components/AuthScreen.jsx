import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Lock, ArrowRight, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { generateSessionId } from '../utils/qrGenerator';
import { audioFX } from '../utils/audioFX';

const AuthScreen = ({ onLoginSuccess, onGuestContinue }) => {
  // Step: 'phone' (Default Registration) | 'otp'
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 7) return;
    audioFX.playButtonClick();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
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
              Enter your mobile number to receive 6-digit OTP verification code.
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
                    <span>Send OTP Code</span>
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

        {/* Step 3: OTP Verification Input */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shadow-md">
                <Lock className="w-7 h-7" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Enter Verification Code</h2>
            <p className="text-xs text-slate-500 mb-4">
              6-digit OTP sent to +91 {phone}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-13 text-center text-xl font-bold bg-slate-50 border border-slate-300 focus:border-violet-600 focus:bg-white text-slate-950 rounded-xl focus:outline-none transition-all"
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
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default AuthScreen;
