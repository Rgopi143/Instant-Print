import React, { useState, useEffect } from 'react';
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
  User,
  Clock,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Database
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { subscribeAdminData } from '../firebase/firestoreService';

const AdminDashboard = ({ user, onExit, onProceedUpload }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'jobs' | 'hardware'
  const [paperLevel, setPaperLevel] = useState(450);
  const [inkLevel, setInkLevel] = useState(94);
  const [actionMessage, setActionMessage] = useState('');

  // Live Firebase states
  const [recentJobs, setRecentJobs] = useState([]);
  const [userLogs, setUserLogs] = useState([]);

  useEffect(() => {
    const unsub = subscribeAdminData(({ orders, logs }) => {
      setRecentJobs(orders);
      setUserLogs(logs);
    });
    return () => unsub();
  }, []);

  const activeJobs = recentJobs;
  const activeLogs = userLogs;

  const handleRefillPaper = () => {
    audioFX.playButtonClick();
    setPaperLevel(500);
    setActionMessage('Paper tray successfully refilled to 500 sheets!');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleRefillInk = () => {
    audioFX.playButtonClick();
    setInkLevel(100);
    setActionMessage('Ink toner cartridge replaced and calibrated to 100%!');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const totalRevenue = activeJobs.reduce((acc, curr) => {
    const val = parseFloat((curr.cost || '0').toString().replace('₹', '')) || 0;
    return acc + val;
  }, 0);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* Top Header Bar */}
      <header className="w-full bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Brand Info & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-slate-900 border border-cyan-400/30 flex items-center justify-center text-white shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 text-lg leading-tight">INSTANT PRINT ADMIN</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Online
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Self-Service Hardware & User Management</p>
          </div>
        </div>



        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2">

          <button
            title={`Admin User: ${user?.phone || 'Master Admin'}`}
            onClick={() => {
              audioFX.playButtonClick();
              alert(`Logged in as Master Administrator\nPhone: ${user?.phone || '8247806042'}\nRole: System Admin`);
            }}
            className="flex items-center justify-center p-2.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 transition-all active:scale-95"
          >
            <User className="w-4.5 h-4.5" />
          </button>

          <button
            title="Proceed to Document Upload"
            onClick={() => {
              audioFX.playButtonClick();
              onProceedUpload();
            }}
            className="flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white font-bold transition-all shadow-md active:scale-95"
          >
            <UploadCloud className="w-4.5 h-4.5" />
          </button>

          <button
            title="Logout Admin"
            onClick={() => {
              audioFX.playButtonClick();
              onExit();
            }}
            className="flex items-center justify-center p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-600 transition-all active:scale-95"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

      </header>

      {/* Action Notification Alert */}
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

      {/* Hardware & Metric Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">PAPER TRAY</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{paperLevel} / 500</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(paperLevel / 500) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">INK TONER</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{inkLevel}%</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-violet-500 h-full rounded-full" style={{ width: `${inkLevel}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{activeJobs.length} Completed Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">USER SESSIONS</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{activeLogs.length} Active</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Live Activity Audit</p>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Print Jobs Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-600" />
                <span>Recent Print Transactions</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Audit trail for print transactions</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-xs">
              {activeJobs.length} Jobs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Time & Date</th>
                  <th className="pb-3">Document / Pages</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeJobs.length > 0 ? (
                  activeJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 font-bold font-mono text-cyan-700">{job.orderId || job.id}</td>
                      <td className="py-3.5 text-slate-500">{job.date || job.time}</td>
                      <td className="py-3.5 font-semibold text-slate-900">
                        {job.name} ({job.pages} pgs, {job.mode})
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">{job.cost}</td>
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600" title={job.status || 'Completed'}>
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Database className="w-8 h-8 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">No print jobs recorded</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: User Login Audit Trail */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-violet-600" />
                <span>User Login Logs</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">System authentication audit trail</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-bold text-[10px]">
              {activeLogs.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">User Contact</th>
                  <th className="pb-3 text-center">Login Method</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3 text-center">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLogs.length > 0 ? (
                  activeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{log.phone}</td>
                      <td className="py-3 text-center">
                        <div 
                          className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 mx-auto"
                          title={log.type || 'SMS OTP Verified'}
                        >
                          {log.role === 'System Admin' ? (
                            <KeyRound className="w-4 h-4 text-cyan-600" />
                          ) : (
                            <Smartphone className="w-4 h-4 text-violet-600" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-slate-500">{log.time}</td>
                      <td className="py-3 text-center">
                        <div 
                          className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto"
                          title={log.role || 'Verified Customer'}
                        >
                          {log.role === 'System Admin' ? (
                            <ShieldCheck className="w-4 h-4 text-cyan-600" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No user login logs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleRefillPaper}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold text-xs transition-colors"
            >
              Refill Paper (500)
            </button>
            <button
              onClick={handleRefillInk}
              className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs transition-colors"
            >
              Reset Toner (100%)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
