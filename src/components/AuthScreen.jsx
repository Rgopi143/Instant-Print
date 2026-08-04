import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Lock, ArrowRight, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { generateSessionId } from '../utils/qrGenerator';
import { audioFX } from '../utils/audioFX';

const AuthScreen = ({ onLoginSuccess, onGuestContinue }) => {
  // Step: 'qr' (Default QR Code Registration) | 'phone' | 'otp'
  const [step, setStep] = useState('qr');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(generateSessionId());

  // Simulate scanning QR and completing registration
  const handleQRRegistrationComplete = () => {
    audioFX.playButtonClick();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        phone: "+91 98765 43210",
        userType: "Registered Mobile Session",
        sessionId,
      });
    }, 700);
  };

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
        {/* Step 1: Default QR Code for New Registration */}
        {step === 'qr' && (
          <div className="space-y-5">
            {/* Header Icon */}
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-md">
                <QrCode className="w-7 h-7" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">New Registration & QR Pair</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Scan this QR code with your mobile camera to complete registration and sync files.
            </p>

            {/* QR Code Canvas Box with Animated Laser Scanner */}
            <div className="relative mx-auto w-56 h-56 bg-white p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center overflow-hidden my-4">
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

                <circle cx="100" cy="100" r="18" fill="#06B6D4" />
                <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">IP</text>
              </svg>

              {/* Laser scanning beam line */}
              <motion.div
                animate={{ y: [0, 200, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-lg shadow-cyan-500/80 pointer-events-none"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              SESSION ID: <span className="text-cyan-700 font-bold">{sessionId}</span>
            </div>

            {/* Primary Action Button: Complete Registration */}
            <button
              onClick={handleQRRegistrationComplete}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Mobile Scan & Register</span>
                </>
              )}
            </button>

            {/* Alternative options */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  audioFX.playButtonClick();
                  setStep('phone');
                }}
                className="text-xs text-cyan-700 hover:text-cyan-800 font-semibold py-1 transition-colors flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Register with Mobile OTP Number</span>
              </button>

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

        {/* Step 2: Mobile Phone Input */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-md">
                <Smartphone className="w-7 h-7" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Mobile Number OTP</h2>
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
                  setStep('qr');
                }}
                className="text-xs text-cyan-700 hover:text-cyan-800 font-semibold py-1 transition-colors flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Back to Registration QR Code</span>
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
