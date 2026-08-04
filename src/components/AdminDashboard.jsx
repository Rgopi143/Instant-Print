import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Printer, 
  FileText, 
  DollarSign, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  UploadCloud, 
  Sliders, 
  HardDrive, 
  Zap,
  TrendingUp,
  Users,
  Smartphone,
  KeyRound,
  UserCheck,
  Clock
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const INITIAL_RECENT_JOBS = [
  { id: 'ORD-8942', time: '14:22 PM', type: 'PDF Document (12 Pgs)', pages: 12, mode: 'B&W', cost: '₹24.00', status: 'Completed' },
  { id: 'ORD-8941', time: '13:50 PM', type: 'Academic Thesis (48 Pgs)', pages: 48, mode: 'Color', cost: '₹288.00', status: 'Completed' },
  { id: 'ORD-8940', time: '12:15 PM', type: 'ID Card Scan (2 Pgs)', pages: 2, mode: 'Color', cost: '₹12.00', status: 'Completed' },
  { id: 'ORD-8939', time: '11:04 AM', type: 'Contract Agreement (8 Pgs)', pages: 8, mode: 'B&W', cost: '₹16.00', status: 'Completed' },
];

const INITIAL_USER_LOGS = [
  { id: 'LOG-1094', phone: '+91 8247392437', type: 'Admin 6-Digit PIN', time: '15:25 PM', status: 'Active Session', device: 'Terminal Kiosk #402', role: 'System Admin' },
  { id: 'LOG-1093', phone: '+91 98765 43210', type: 'SMS OTP Verified', time: '14:48 PM', status: 'Completed', device: 'Mobile Companion', role: 'Verified Customer' },
  { id: 'LOG-1092', phone: '+91 91234 56789', type: 'SMS OTP Verified', time: '13:10 PM', status: 'Completed', device: 'Terminal Kiosk #402', role: 'Verified Customer' },
  { id: 'LOG-1091', phone: 'Guest User', type: 'Direct Guest Session', time: '11:35 AM', status: 'Session Closed', device: 'Terminal Kiosk #402', role: 'Guest Customer' },
  { id: 'LOG-1090', phone: '+91 99887 76655', type: 'SMS OTP Verified', time: '10:15 AM', status: 'Session Closed', device: 'Mobile Companion', role: 'Verified Customer' },
];

const AdminDashboard = ({ user, onExit, onProceedUpload }) => {
  const [paperLevel, setPaperLevel] = useState(450);
  const [inkLevel, setInkLevel] = useState(94);
  const [recentJobs, setRecentJobs] = useState(INITIAL_RECENT_JOBS);
  const [userLogs, setUserLogs] = useState(INITIAL_USER_LOGS);
  const [actionMessage, setActionMessage] = useState('');

  const handleRefillPaper = () => {
    audioFX.playButtonClick();
    setPaperLevel(500);
    setActionMessage('Paper tray successfully refilled to 500 sheets!');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleRefillInk = () => {
    audioFX.playButtonClick();
    setInkLevel(100);
    setActionMessage('CMYK Ink Cartridges successfully calibrated & topped up!');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleRunDiagnostics = () => {
    audioFX.playPrinterRollerPulse();
    setActionMessage('Running printer head cleaning & motor diagnostics... All systems normal!');
    setTimeout(() => setActionMessage(''), 3500);
  };

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">Admin Command Center</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE TERMINAL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Authenticated Admin Session • Mobile: <span className="font-semibold text-slate-800">{user?.phone || '+91 8247392437'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              audioFX.playButtonClick();
              onProceedUpload();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Proceed to Print Upload</span>
          </button>
          
          <button
            onClick={() => {
              audioFX.playButtonClick();
              onExit();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-600 font-bold text-xs transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Quick Status Notification */}
      {actionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </motion.div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TODAY'S REVENUE</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹4,850.00</div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs yesterday</span>
          </div>
        </div>

        {/* Metric 2: Total Prints */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL PRINTS</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">142 Jobs</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>682 total pages generated</span>
          </div>
        </div>

        {/* Metric 3: Paper Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PAPER TRAY LEVEL</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{paperLevel} / 500</div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200">
            <div 
              className="h-full bg-violet-600 transition-all duration-500" 
              style={{ width: `${(paperLevel / 500) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 4: Ink Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">INK CMYK AVERAGE</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{inkLevel}% Avg</div>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            <div className="h-1.5 bg-cyan-500 rounded-full" title="Cyan 92%"></div>
            <div className="h-1.5 bg-fuchsia-500 rounded-full" title="Magenta 88%"></div>
            <div className="h-1.5 bg-amber-400 rounded-full" title="Yellow 95%"></div>
            <div className="h-1.5 bg-slate-800 rounded-full" title="Black 98%"></div>
          </div>
        </div>

      </div>

      {/* Quick Hardware Controls & Diagnostics */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-600" />
          <span>Hardware Service Controls</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleRefillPaper}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 text-left transition-all active:scale-95 group"
          >
            <div>
              <span className="font-bold text-slate-900 text-sm block group-hover:text-violet-700">Refill Paper Tray</span>
              <span className="text-[11px] text-slate-500">Reset paper count to 500 A4 sheets</span>
            </div>
            <FileText className="w-5 h-5 text-slate-400 group-hover:text-violet-600 shrink-0" />
          </button>

          <button
            onClick={handleRefillInk}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition-all active:scale-95 group"
          >
            <div>
              <span className="font-bold text-slate-900 text-sm block group-hover:text-cyan-700">Top-up CMYK Ink</span>
              <span className="text-[11px] text-slate-500">Calibrate & top up cartridge levels</span>
            </div>
            <Activity className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 shrink-0" />
          </button>

          <button
            onClick={handleRunDiagnostics}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all active:scale-95 group"
          >
            <div>
              <span className="font-bold text-slate-900 text-sm block group-hover:text-amber-700">Run Diagnostics</span>
              <span className="text-[11px] text-slate-500">Self-clean laser printhead & rollers</span>
            </div>
            <Zap className="w-5 h-5 text-slate-400 group-hover:text-amber-600 shrink-0" />
          </button>
        </div>
      </div>

      {/* User Login & Session Audit Logs Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">User Login & Authentication Logs</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Total {userLogs.length} Sessions Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Log ID</th>
                <th className="pb-3">User Contact</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Login Method</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Device Terminal</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-bold font-mono text-violet-700">{log.id}</td>
                  <td className="py-3.5 font-bold text-slate-900">{log.phone}</td>
                  <td className="py-3.5 font-semibold text-slate-700">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      log.role === 'System Admin' 
                        ? 'bg-amber-50 border border-amber-200 text-amber-800 font-bold' 
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-slate-800 flex items-center gap-1.5">
                    {log.type.includes('Admin') ? (
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                    )}
                    <span>{log.type}</span>
                  </td>
                  <td className="py-3.5 text-slate-500">{log.time}</td>
                  <td className="py-3.5 text-slate-600">{log.device}</td>
                  <td className="py-3.5 text-right">
                    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      log.status === 'Active Session'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold animate-pulse'
                        : 'bg-slate-100 border border-slate-200 text-slate-600'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Log Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-cyan-600" />
            <span>Recent Kiosk Print Transactions</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Showing last {recentJobs.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Document</th>
                <th className="pb-3">Pages</th>
                <th className="pb-3">Color Mode</th>
                <th className="pb-3">Total Paid</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-bold font-mono text-cyan-700">{job.id}</td>
                  <td className="py-3.5 text-slate-500">{job.time}</td>
                  <td className="py-3.5 font-semibold text-slate-800">{job.type}</td>
                  <td className="py-3.5 text-slate-600">{job.pages} pgs</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      job.mode === 'Color' 
                        ? 'bg-cyan-50 border border-cyan-200 text-cyan-700' 
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}>
                      {job.mode}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-slate-900">{job.cost}</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
