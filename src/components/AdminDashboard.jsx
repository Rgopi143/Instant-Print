import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Printer, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  LogOut, 
  UploadCloud, 
  Zap,
  Users,
  Smartphone,
  KeyRound,
  UserCheck,
  User,
  Clock,
  ChevronRight,
  Database,
  ArrowLeft,
  ArrowUp,
  Search,
  Filter,
  X,
  Palette,
  RefreshCw,
  Sliders,
  Layers,
  Eye,
  Download,
  Lock
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { 
  subscribeAdminData, 
  subscribeHardwareStatus, 
  updateHardwareStatus,
  createPrintOrder,
  recordUploadedDocument,
  updateUserPin
} from '../firebase/firestoreService';

const AdminDashboard = ({ user, onExit, onProceedUpload }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'user-logs'
  const [paperLevel, setPaperLevel] = useState(450);
  const [inkLevel, setInkLevel] = useState(94);
  const [actionMessage, setActionMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobModeFilter, setJobModeFilter] = useState('all');

  // Admin Upload, Document Preview & Floating Profile Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserPhone, setSelectedUserPhone] = useState('+91 8247806042');
  const [isUploading, setIsUploading] = useState(false);
  const [previewJob, setPreviewJob] = useState(null);

  // Change PIN / Password states
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  // Live Firebase states
  const [recentJobs, setRecentJobs] = useState([]);
  const [userLogs, setUserLogs] = useState([]);

  useEffect(() => {
    const unsubAdmin = subscribeAdminData(({ orders, logs }) => {
      setRecentJobs(orders);
      setUserLogs(logs);
    });
    const unsubHardware = subscribeHardwareStatus((status) => {
      if (status) {
        if (status.paperLevel !== undefined) setPaperLevel(status.paperLevel);
        if (status.inkLevel !== undefined) setInkLevel(status.inkLevel);
      }
    });
    return () => {
      unsubAdmin();
      unsubHardware();
    };
  }, []);

  const activeJobs = recentJobs;
  const activeLogs = userLogs;

  const filteredLogs = activeLogs.filter(log => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (log.phone || '').toLowerCase().includes(query) ||
      (log.type || '').toLowerCase().includes(query) ||
      (log.role || '').toLowerCase().includes(query) ||
      (log.id || '').toLowerCase().includes(query);
      
    const matchesRole = roleFilter === 'all' || 
      log.role === roleFilter || 
      (roleFilter === 'Guest Customer' && (log.phone === 'Guest User' || log.role === 'Guest Customer'));

    return matchesSearch && matchesRole;
  });

  // Revenue Analytics & Order Breakdown Computations
  const colorJobs = activeJobs.filter(job => {
    const modeStr = (job.mode || job.colorMode || '').toLowerCase();
    return modeStr.includes('color');
  });
  const bwJobs = activeJobs.filter(job => {
    const modeStr = (job.mode || job.colorMode || '').toLowerCase();
    return !modeStr.includes('color');
  });

  const totalOrdersCount = activeJobs.length;
  const colorOrdersCount = colorJobs.length;
  const bwOrdersCount = bwJobs.length;

  const colorPercentage = totalOrdersCount > 0 ? Math.round((colorOrdersCount / totalOrdersCount) * 100) : 0;
  const bwPercentage = totalOrdersCount > 0 ? Math.round((bwOrdersCount / totalOrdersCount) * 100) : 0;

  const colorRevenue = colorJobs.reduce((acc, curr) => {
    const val = parseFloat((curr.cost || '0').toString().replace('₹', '')) || 0;
    return acc + val;
  }, 0);

  const bwRevenue = bwJobs.reduce((acc, curr) => {
    const val = parseFloat((curr.cost || '0').toString().replace('₹', '')) || 0;
    return acc + val;
  }, 0);

  const filteredRevenueJobs = activeJobs.filter(job => {
    const query = jobSearchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (job.name || '').toLowerCase().includes(query) ||
      (job.orderId || job.id || '').toLowerCase().includes(query) ||
      (job.phone || '').toLowerCase().includes(query);

    const modeStr = (job.mode || '').toLowerCase();
    const matchesMode = jobModeFilter === 'all' ||
      (jobModeFilter === 'color' && modeStr.includes('color')) ||
      (jobModeFilter === 'bw' && !modeStr.includes('color'));

    return matchesSearch && matchesMode;
  });

  const handleRefillPaper = () => {
    audioFX.playButtonClick();
    setPaperLevel(500);
    updateHardwareStatus({ paperLevel: 500, inkLevel });
    setActionMessage('Paper tray successfully refilled to 500 sheets!');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleRefillInk = () => {
    audioFX.playButtonClick();
    setInkLevel(100);
    updateHardwareStatus({ paperLevel, inkLevel: 100 });
    setActionMessage('Ink toner cartridge replaced and calibrated to 100%!');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleAdminFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    audioFX.playButtonClick();
    setIsUploading(true);

    const fileName = file.name;
    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    let pagesCount = 1;
    if (file.name.toLowerCase().endsWith('.pdf')) {
      pagesCount = Math.floor(Math.random() * 4) + 2;
    }

    let category = 'PDF';
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      category = 'Photo';
    } else if (['doc', 'docx', 'txt'].includes(ext)) {
      category = 'Document';
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const targetPhone = selectedUserPhone || user?.phone || '+91 8247806042';

      await createPrintOrder({
        id: orderId,
        orderId: orderId,
        name: fileName,
        pages: pagesCount,
        mode: 'B&W Double-Sided',
        cost: `₹${(pagesCount * 2).toFixed(2)}`,
        category: category,
        phone: targetPhone,
        previewUrl: dataUrl,
        uploadedBy: 'Admin'
      });

      await recordUploadedDocument({
        id: orderId,
        name: fileName,
        size: fileSizeFormatted,
        pages: pagesCount,
        category: category,
        userPhone: targetPhone,
        previewUrl: dataUrl
      });

      setIsUploading(false);
      setShowUploadModal(false);
      setActionMessage(`Document "${fileName}" successfully stored in Firebase for ${targetPhone}!`);
      setTimeout(() => setActionMessage(''), 4000);
    };

    reader.readAsDataURL(file);
  };

  const handleChangePinSubmit = async (e) => {
    e.preventDefault();
    audioFX.playButtonClick();

    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      setPinMessage('New PIN must be between 4 and 8 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage('New PIN and Confirm PIN do not match!');
      return;
    }

    setIsSavingPin(true);
    const targetPhone = user?.phone || '8247806042';
    const res = await updateUserPin(targetPhone, currentPin, newPin);
    setIsSavingPin(false);

    if (res.success) {
      setPinMessage('Security PIN successfully updated & saved in Firebase!');
      setActionMessage('Security PIN successfully updated!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setShowChangePin(false);
        setPinMessage('');
        setActionMessage('');
      }, 2500);
    } else {
      setPinMessage(res.message || 'Failed to update PIN.');
    }
  };

  const totalRevenue = activeJobs.reduce((acc, curr) => {
    const val = parseFloat((curr.cost || '0').toString().replace('₹', '')) || 0;
    return acc + val;
  }, 0);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* Top Header Bar */}
      <header className="w-full bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 mb-6 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        
        {/* Left: Brand Info & Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-600 to-slate-900 border border-cyan-400/30 flex items-center justify-center text-white shadow-md shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-slate-900 text-xs sm:text-lg leading-tight truncate">INSTANT PRINT ADMIN</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate hidden sm:block">Self-Service Hardware & User Management</p>
            <p className="text-[9px] text-slate-500 mt-0.5 truncate sm:hidden">Admin Portal</p>
          </div>
        </div>

        {/* Right: User Profile & Actions (Aligned Inline on Right Side) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          <button
            title={`View Admin Profile Details (${user?.phone || 'Master Admin'})`}
            onClick={() => {
              audioFX.playButtonClick();
              setShowProfileModal(true);
            }}
            className="flex items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 transition-all active:scale-95 shadow-xs"
          >
            <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            title="Upload Document to User"
            onClick={() => {
              audioFX.playButtonClick();
              setShowUploadModal(true);
            }}
            className="flex items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white font-bold transition-all shadow-md active:scale-95"
          >
            <UploadCloud className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <div className="h-5 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1"></div>

          <button
            title="Logout Admin"
            onClick={() => {
              audioFX.playButtonClick();
              onExit();
            }}
            className="flex items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-600 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
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
        
        <div 
          onClick={() => {
            audioFX.playButtonClick();
            setActiveTab('paper-status');
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-cyan-100/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-cyan-600 uppercase tracking-wider transition-colors">PAPER TRAY</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-slate-900">{paperLevel} / 500</div>
              <span className="text-[10px] font-bold text-cyan-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Stock Info <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${(paperLevel / 500) * 100}%` }}></div>
            </div>
            <p className="text-[10px] text-cyan-700 font-semibold mt-1">A4 Standard Plain Paper (80 GSM)</p>
          </div>
        </div>

        <div 
          onClick={() => {
            audioFX.playButtonClick();
            setActiveTab('ink-status');
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-violet-400 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-violet-100/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-violet-600 uppercase tracking-wider transition-colors">INK TONER</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 group-hover:bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-600 transition-colors">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-slate-900">{inkLevel}%</div>
              <span className="text-[10px] font-bold text-violet-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Capacity <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-violet-500 h-full rounded-full transition-all duration-300" style={{ width: `${inkLevel}%` }}></div>
            </div>
            <p className="text-[10px] text-violet-700 font-semibold mt-1">~{Math.round((inkLevel / 100) * 5000).toLocaleString()} copies remaining</p>
          </div>
        </div>

        <div 
          onClick={() => {
            audioFX.playButtonClick();
            setActiveTab('revenue');
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-100/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-emerald-600 uppercase tracking-wider transition-colors">TOTAL REVENUE</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-slate-900">₹{totalRevenue.toFixed(2)}</div>
              <span className="text-[10px] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Breakdown <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{activeJobs.length} Completed Orders</p>
          </div>
        </div>

        <div 
          onClick={() => {
            audioFX.playButtonClick();
            setActiveTab('user-logs');
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-amber-100/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-amber-600 uppercase tracking-wider transition-colors">USER SESSIONS</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 group-hover:bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-slate-900">{activeLogs.length} Active</div>
              <span className="text-[10px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View Page <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Live Activity Audit</p>
          </div>
        </div>

      </div>

      {/* Main Content View Switcher */}
      {activeTab === 'overview' ? (
        /* Main Dashboard Overview View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Recent Print Jobs Table (2 Cols on lg) */}
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

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs align-middle">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 bg-white whitespace-nowrap pr-3">Order ID</th>
                    <th className="pb-3 bg-white whitespace-nowrap pr-3">Time & Date</th>
                    <th className="pb-3 bg-white pr-3">Document Name</th>
                    <th className="pb-3 bg-white whitespace-nowrap pr-3 text-right">Cost</th>
                    <th className="pb-3 text-center bg-white whitespace-nowrap pl-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeJobs.length > 0 ? (
                    activeJobs.map((job) => (
                      <tr 
                        key={job.id} 
                        onClick={() => {
                          audioFX.playButtonClick();
                          setPreviewJob(job);
                        }}
                        className="hover:bg-cyan-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 pr-3 font-bold font-mono text-cyan-700 group-hover:underline whitespace-nowrap align-middle">
                          {job.orderId || job.id}
                        </td>
                        <td className="py-3.5 pr-3 text-slate-500 whitespace-nowrap align-middle">
                          {job.date || job.time}
                        </td>
                        <td className="py-3.5 pr-3 font-semibold text-slate-900 group-hover:text-cyan-700 group-hover:underline align-middle">
                          {job.name}
                        </td>
                        <td className="py-3.5 pr-3 font-bold text-slate-900 whitespace-nowrap align-middle text-right">
                          {job.cost}
                        </td>
                        <td className="py-3.5 pl-3 text-center whitespace-nowrap align-middle">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              audioFX.playButtonClick();
                              setPreviewJob(job);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px] transition-colors" 
                            title="Click to Preview Document"
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Preview</span>
                          </button>
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

            {/* Mobile Card List View */}
            <div className="block sm:hidden space-y-2.5 max-h-[380px] overflow-y-auto pr-0.5">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => {
                      audioFX.playButtonClick();
                      setPreviewJob(job);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200 flex flex-col gap-2 cursor-pointer transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-cyan-700 text-xs">{job.orderId || job.id}</span>
                      <span className="font-black text-slate-900 text-xs">{job.cost}</span>
                    </div>

                    <div className="font-semibold text-slate-900 text-xs break-words">{job.name}</div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/80">
                      <span className="text-slate-500">{job.date || job.time}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                        <Eye className="w-3 h-3 text-emerald-600" />
                        Preview
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <p className="font-semibold text-slate-600 text-xs">No print jobs recorded</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: User Login Audit Trail (HIDDEN ON MOBILE, visible only on Desktop lg viewports) */}
          <div className="hidden lg:block bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-violet-600" />
                  <span>User Login Logs</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">System authentication audit trail</p>
              </div>
              <button 
                onClick={() => {
                  audioFX.playButtonClick();
                  setActiveTab('user-logs');
                }}
                className="px-2 py-0.5 rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-bold text-[10px] transition-colors"
              >
                View Page →
              </button>
            </div>

            <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 bg-white">User Contact</th>
                    <th className="pb-3 text-center bg-white">Method</th>
                    <th className="pb-3 bg-white">Time</th>
                    <th className="pb-3 text-center bg-white">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLogs.length > 0 ? (
                    activeLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-bold text-slate-900">{log.phone}</td>
                        <td className="py-3 text-center">
                          <div 
                            className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 mx-auto"
                            title={log.type || 'SMS OTP Verified'}
                          >
                            {log.role === 'System Admin' ? (
                              <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
                            ) : (
                              <Smartphone className="w-3.5 h-3.5 text-violet-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-slate-500">{log.time}</td>
                        <td className="py-3 text-center">
                          <div 
                            className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto"
                            title={log.role || 'Verified Customer'}
                          >
                            {log.role === 'System Admin' ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
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
      ) : activeTab === 'user-logs' ? (
        /* Dedicated User Login Logs Page View (Opened when clicking USER SESSIONS container) */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          {/* Top Bar with Back Button & Centered Title */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pb-6 mb-6 border-b border-slate-100">
            <button
              title="Back to Dashboard"
              onClick={() => {
                audioFX.playButtonClick();
                setActiveTab('overview');
              }}
              className="flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-slate-700" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            
            <div className="text-center flex-1 mx-1 sm:mx-4">
              <h3 className="text-base sm:text-xl font-black text-slate-900 flex items-center justify-center gap-1.5 sm:gap-2">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
                <span>User Sessions & Login Audit</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">Real-time authentication records & active user sessions</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-bold text-[10px] sm:text-xs">
                {activeLogs.length} Total Logs
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sessions</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{activeLogs.length}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Logins</span>
              <p className="text-xl font-black text-cyan-700 mt-0.5">
                {activeLogs.filter(l => l.role === 'System Admin').length}
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Logins</span>
              <p className="text-xl font-black text-violet-700 mt-0.5">
                {activeLogs.filter(l => l.role !== 'System Admin' && l.role !== 'Guest Customer' && l.phone !== 'Guest User').length}
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guest Sessions</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">
                {activeLogs.filter(l => l.role === 'Guest Customer' || l.phone === 'Guest User').length}
              </p>
            </div>
          </div>

          {/* Search & Filter Inputs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone number or log ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Custom Responsive Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0 hidden sm:inline-flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Role:
              </span>
              {[
                { id: 'all', label: 'All Roles' },
                { id: 'System Admin', label: 'Admin' },
                { id: 'Verified Customer', label: 'Customer' },
                { id: 'Guest Customer', label: 'Guest' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => {
                    audioFX.playButtonClick();
                    setRoleFilter(pill.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all active:scale-95 ${
                    roleFilter === pill.id
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Logs Table / Mobile List with Scroll Container */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-y-auto max-h-[420px] sm:max-h-[520px] pr-0.5">
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-4">Log ID</th>
                    <th className="py-3.5 px-4">User Contact / Phone</th>
                    <th className="py-3.5 px-4 text-center">Login Method</th>
                    <th className="py-3.5 px-4 text-center">User Role</th>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{log.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{log.phone}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 font-semibold text-[11px]">
                            {log.role === 'System Admin' ? (
                              <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
                            ) : (
                              <Smartphone className="w-3.5 h-3.5 text-violet-600" />
                            )}
                            {log.type || 'SMS OTP Verified'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${
                            log.role === 'System Admin' 
                              ? 'bg-cyan-50 border-cyan-200 text-cyan-800' 
                              : log.role === 'Guest Customer' || log.phone === 'Guest User'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}>
                            {log.role === 'System Admin' ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {log.role || 'Verified Customer'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {log.time}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {log.status || 'Active Session'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserCheck className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600 text-sm">No matching user login records</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block sm:hidden divide-y divide-slate-100 bg-white p-2">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-3.5 my-1.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-3">
                    
                    {/* Header Row: Role Icon, User Phone & ID, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          log.role === 'System Admin' 
                            ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                            : log.role === 'Guest Customer' || log.phone === 'Guest User'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {log.role === 'System Admin' ? (
                            <ShieldCheck className="w-5 h-5" />
                          ) : (
                            <UserCheck className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{log.phone}</h4>
                          <span className="font-mono text-[10px] text-slate-400 block truncate">{log.id}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {log.status || 'Active Session'}
                      </span>
                    </div>

                    {/* Footer Row: Timestamp & Badges */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {log.time}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-semibold text-[10px] ${
                          log.role === 'System Admin' 
                            ? 'bg-cyan-50 border-cyan-200 text-cyan-800' 
                            : log.role === 'Guest Customer' || log.phone === 'Guest User'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}>
                          {log.role || 'Customer'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-medium shadow-xs">
                          {log.type || 'SMS OTP Verified'}
                        </span>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <p className="font-semibold text-slate-600 text-sm">No matching user login records</p>
                </div>
              )}
            </div>

          </div>

        </motion.div>
      ) : activeTab === 'revenue' ? (
        /* Dedicated Revenue Analytics & Orders Page View (Opened when clicking TOTAL REVENUE container) */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          {/* Top Bar with Back Button & Centered Title */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pb-6 mb-6 border-b border-slate-100">
            <button
              title="Back to Dashboard"
              onClick={() => {
                audioFX.playButtonClick();
                setActiveTab('overview');
              }}
              className="flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-slate-700" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            
            <div className="text-center flex-1 mx-1 sm:mx-4">
              <h3 className="text-base sm:text-xl font-black text-slate-900 flex items-center justify-center gap-1.5 sm:gap-2">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
                <span>Revenue Analytics & Order Breakdown</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">Financial performance, print mode distribution & transaction history</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] sm:text-xs">
                ₹{totalRevenue.toFixed(2)} Total
              </span>
            </div>
          </div>

          {/* Revenue & Order Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">₹{totalRevenue.toFixed(2)}</p>
              <span className="text-[10px] font-semibold text-slate-500">₹{(totalRevenue / (activeJobs.length || 1)).toFixed(2)} avg / order</span>
            </div>
            
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{totalOrdersCount}</p>
              <span className="text-[10px] font-bold text-emerald-600">100% Completed</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color Orders</span>
              <p className="text-xl font-black text-violet-700 mt-0.5">{colorOrdersCount}</p>
              <span className="text-[10px] font-bold text-violet-600">{colorPercentage}% of orders (₹{colorRevenue.toFixed(2)})</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">B&W Orders</span>
              <p className="text-xl font-black text-slate-700 mt-0.5">{bwOrdersCount}</p>
              <span className="text-[10px] font-bold text-slate-600">{bwPercentage}% of orders (₹{bwRevenue.toFixed(2)})</span>
            </div>
          </div>

          {/* Color vs Black & White Print Distribution Visual Share Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6">
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Palette className="w-4 h-4 text-violet-600" />
                <span>Print Mode Share Ratio</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-[11px]">
                <span className="text-violet-700">● Color: {colorPercentage}% ({colorOrdersCount})</span>
                <span className="text-slate-600">● B&W: {bwPercentage}% ({bwOrdersCount})</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-500" 
                style={{ width: `${colorPercentage}%` }}
                title={`Color Prints: ${colorPercentage}%`}
              />
              <div 
                className="bg-slate-700 h-full transition-all duration-500" 
                style={{ width: `${bwPercentage}%` }}
                title={`B&W Prints: ${bwPercentage}%`}
              />
            </div>
          </div>

          {/* Search & Mode Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order ID or doc name..."
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {jobSearchQuery && (
                <button 
                  onClick={() => setJobSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills for Revenue View */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'color', label: 'Color Only' },
                { id: 'bw', label: 'B&W Only' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => {
                    audioFX.playButtonClick();
                    setJobModeFilter(pill.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all active:scale-95 ${
                    jobModeFilter === pill.id
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List Container with Scroll */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-y-auto max-h-[420px] sm:max-h-[520px] pr-0.5">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs align-middle">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Time & Date</th>
                    <th className="py-3.5 px-4">Document / Pages</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">Print Mode</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Cost</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRevenueJobs.length > 0 ? (
                    filteredRevenueJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-700 whitespace-nowrap align-middle">{job.orderId || job.id}</td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap align-middle">{job.date || job.time}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 align-middle">
                          {job.name} ({job.pages} pgs)
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold text-[11px] ${
                            (job.mode || '').toLowerCase().includes('color')
                              ? 'bg-violet-50 border-violet-200 text-violet-700'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            {job.mode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-right whitespace-nowrap align-middle">{job.cost}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600" title={job.status || 'Completed'}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Database className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600 text-sm">No print transactions match criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block sm:hidden divide-y divide-slate-100 bg-white p-2">
              {filteredRevenueJobs.length > 0 ? (
                filteredRevenueJobs.map((job) => (
                  <div key={job.id} className="p-3.5 my-1.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-700 text-xs">{job.orderId || job.id}</span>
                      <span className="font-black text-slate-900 text-sm">{job.cost}</span>
                    </div>

                    <div className="font-semibold text-slate-900 text-xs line-clamp-1">{job.name}</div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">{job.date || job.time}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-semibold text-[10px] ${
                        (job.mode || '').toLowerCase().includes('color')
                          ? 'bg-violet-50 border-violet-200 text-violet-700'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {job.mode} ({job.pages} pgs)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <p className="font-semibold text-slate-600 text-sm">No matching print transactions</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : activeTab === 'ink-status' ? (
        /* Dedicated Ink Toner Status & Capacity Page View (Opened when clicking INK TONER container) */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          {/* Top Bar with Back Button & Centered Title */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pb-6 mb-6 border-b border-slate-100">
            <button
              title="Back to Dashboard"
              onClick={() => {
                audioFX.playButtonClick();
                setActiveTab('overview');
              }}
              className="flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-slate-700" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            
            <div className="text-center flex-1 mx-1 sm:mx-4">
              <h3 className="text-base sm:text-xl font-black text-slate-900 flex items-center justify-center gap-1.5 sm:gap-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
                <span>Ink Toner Capacity & Copies Estimate</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">Toner level percentage, printable page capacity & CMYK cartridge breakdown</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-bold text-[10px] sm:text-xs">
                {inkLevel}% Available
              </span>
            </div>
          </div>

          {/* Main Ink Capacity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            
            <div className="bg-gradient-to-br from-violet-950 to-slate-900 text-white p-5 rounded-2xl border border-violet-800/50 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">Overall Toner Level</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[10px] font-bold">
                  {inkLevel > 30 ? 'System Optimal' : 'Low Toner Warning'}
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{inkLevel}%</div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 border border-violet-500/30">
                  <div className="bg-gradient-to-r from-violet-500 to-fuchsia-400 h-full rounded-full transition-all duration-500" style={{ width: `${inkLevel}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remaining B&W Copies</span>
                <Printer className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  ~{Math.round((inkLevel / 100) * 5000).toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">Printable Standard A4 Pages</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remaining Color Copies</span>
                <Palette className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-violet-900">
                  ~{Math.round((inkLevel / 100) * 2500).toLocaleString()}
                </div>
                <p className="text-xs text-violet-600 font-medium mt-1">High Density Color Documents</p>
              </div>
            </div>

          </div>

          {/* CMYK Cartridge Level Breakdown */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-6">
            <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-600" />
              <span>CMYK Cartridge Toner Levels & Page Yield</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cyan */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-cyan-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    Cyan (C) Toner
                  </span>
                  <span className="text-slate-900">{Math.min(100, inkLevel + 2)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min(100, inkLevel + 2)}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">~{Math.round((Math.min(100, inkLevel + 2) / 100) * 2500).toLocaleString()} color pages remaining</span>
              </div>

              {/* Magenta */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-fuchsia-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500"></span>
                    Magenta (M) Toner
                  </span>
                  <span className="text-slate-900">{Math.min(100, Math.max(10, inkLevel - 3))}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(10, inkLevel - 3))}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">~{Math.round((Math.min(100, Math.max(10, inkLevel - 3)) / 100) * 2500).toLocaleString()} color pages remaining</span>
              </div>

              {/* Yellow */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Yellow (Y) Toner
                  </span>
                  <span className="text-slate-900">{Math.min(100, Math.max(10, inkLevel - 1))}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(10, inkLevel - 1))}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">~{Math.round((Math.min(100, Math.max(10, inkLevel - 1)) / 100) * 2500).toLocaleString()} color pages remaining</span>
              </div>

              {/* Key Black */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    Key Black (K) Toner
                  </span>
                  <span className="text-slate-900">{inkLevel}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full" style={{ width: `${inkLevel}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">~{Math.round((inkLevel / 100) * 5000).toLocaleString()} B&W pages remaining</span>
              </div>
            </div>
          </div>

          {/* Action Refill Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                audioFX.playButtonClick();
                setActiveTab('overview');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              ← Back to Dashboard Overview
            </button>

            <button
              onClick={handleRefillInk}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset & Calibrate Toner (100%)</span>
            </button>
          </div>
        </motion.div>
      ) : activeTab === 'paper-status' ? (
        /* Dedicated Paper Tray & Stock Inventory Page View (Opened when clicking PAPER TRAY container) */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          {/* Top Bar with Back Button & Centered Title */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pb-6 mb-6 border-b border-slate-100">
            <button
              title="Back to Dashboard"
              onClick={() => {
                audioFX.playButtonClick();
                setActiveTab('overview');
              }}
              className="flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-slate-700" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            
            <div className="text-center flex-1 mx-1 sm:mx-4">
              <h3 className="text-base sm:text-xl font-black text-slate-900 flex items-center justify-center gap-1.5 sm:gap-2">
                <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 shrink-0" />
                <span>Paper Tray & Media Stock Inventory</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">Paper feeder capacity, paper specifications & multi-tray stock levels</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-[10px] sm:text-xs">
                {paperLevel} Sheets Stocked
              </span>
            </div>
          </div>

          {/* Main Paper Stock Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            
            <div className="bg-gradient-to-br from-cyan-950 to-slate-900 text-white p-5 rounded-2xl border border-cyan-800/50 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Main Tray 1 Feed</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[10px] font-bold">
                  {paperLevel > 50 ? 'Stock Ready' : 'Low Paper Alert'}
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{paperLevel} <span className="text-sm font-semibold text-cyan-300">/ 500 Sheets</span></div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 border border-cyan-500/30">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${(paperLevel / 500) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Machine Paper Stock</span>
                <FileText className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {paperLevel + 250} Sheets
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">Across 3 Active Feed Trays</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Media Type</span>
                <Layers className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  A4 Plain White
                </div>
                <p className="text-xs text-cyan-700 font-semibold mt-1">75-80 GSM Premium Uncoated</p>
              </div>
            </div>

          </div>

          {/* Individual Trays Stock & Paper Type Breakdown */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-6">
            <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Printer className="w-4 h-4 text-cyan-600" />
              <span>Multi-Tray Paper Stock & Specifications</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Tray 1 - A4 Standard */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                      Tray 1 (Primary Feed)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-bold">Active</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">A4 Standard Plain Paper</p>
                  <p className="text-[10px] text-slate-400">210 × 297 mm • 80 GSM • Bright White</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 text-[10px]">Stock Level:</span>
                    <span className="text-cyan-700">{paperLevel} / 500 sheets ({Math.round((paperLevel / 500) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${(paperLevel / 500) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Tray 2 - Photo Glossy */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                      Tray 2 (Photo Bypass)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[10px] font-bold">Ready</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">A4 Glossy Photo Paper</p>
                  <p className="text-[10px] text-slate-400">210 × 297 mm • 200 GSM • Ultra Gloss</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 text-[10px]">Stock Level:</span>
                    <span className="text-violet-700">150 / 200 sheets (75%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-violet-500 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              {/* Tray 3 - Legal / Bond */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Tray 3 (Legal / Heavy)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">Ready</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">Legal / Certificate Bond</p>
                  <p className="text-[10px] text-slate-400">216 × 356 mm • 100 GSM • Smooth Ivory</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 text-[10px]">Stock Level:</span>
                    <span className="text-amber-700">100 / 150 sheets (67%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Action Refill Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                audioFX.playButtonClick();
                setActiveTab('overview');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              ← Back to Dashboard Overview
            </button>

            <button
              onClick={handleRefillPaper}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refill Main Paper Tray (500 Sheets)</span>
            </button>
          </div>
        </motion.div>
      ) : null}

      {/* Admin Upload Document to User Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full relative"
          >
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Upload Document to User</h3>
                <p className="text-xs text-slate-500">Store document metadata & preview in Firebase</p>
              </div>
            </div>

            {/* Target User Selection */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Target User Account
              </label>
              <select
                value={selectedUserPhone}
                onChange={(e) => setSelectedUserPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
              >
                <option value="+91 8247806042">+91 8247806042 (Master Admin)</option>
                <option value="+91 8247392437">+91 8247392437 (System Administrator)</option>
                <option value="+91 8247392436">+91 8247392436 (Rahul Sharma)</option>
                <option value="Guest User">Guest User (Direct Session)</option>
              </select>
            </div>

            {/* Dropzone File Upload Input */}
            <label className="border-2 border-dashed border-cyan-300 hover:border-cyan-500 bg-cyan-50/40 hover:bg-cyan-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all mb-4">
              <UploadCloud className="w-10 h-10 text-cyan-600 mb-2 animate-bounce" />
              <span className="text-sm font-bold text-slate-900">
                {isUploading ? 'Uploading to Firebase...' : 'Click to Pick or Drop Document'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Supports PDF, PNG, JPG, DOCX (Max 25MB)</span>
              <input
                type="file"
                disabled={isUploading}
                onChange={handleAdminFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                className="hidden"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Document Preview Modal when Clicking any Document/Order */}
      {previewJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-white truncate">{previewJob.name}</h3>
                  <span className="text-[11px] text-cyan-300 font-mono block truncate">
                    {previewJob.orderId || previewJob.id} • {previewJob.phone || previewJob.userPhone || 'Guest User'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPreviewJob(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full Document Specifications Banner */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Document Type</span>
                <span className="font-bold text-cyan-700 mt-0.5 block truncate" title={previewJob.category || 'PDF Document'}>
                  {previewJob.category || 'PDF Document'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Pages</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {previewJob.pages || 1} Page(s)
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Print Mode</span>
                <span className="font-bold text-violet-700 mt-0.5 block truncate" title={previewJob.mode || 'B&W Single-Sided'}>
                  {previewJob.mode || 'B&W Single-Sided'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Cost</span>
                <span className="font-black text-emerald-700 mt-0.5 block">
                  {previewJob.cost || '₹6.00'}
                </span>
              </div>
            </div>

            {/* Document Preview Body Canvas */}
            <div className="p-6 bg-slate-100 overflow-y-auto flex-1 flex flex-col items-center justify-center">
              {previewJob.previewUrl ? (
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-300 shadow-lg p-4 relative overflow-hidden">
                  {previewJob.previewUrl.startsWith('data:image') ? (
                    <img 
                      src={previewJob.previewUrl} 
                      alt={previewJob.name} 
                      className="w-full h-auto max-h-72 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative shadow-inner">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                          <span className="font-mono text-[10px] text-slate-400">PAGE 1 OF {previewJob.pages || 1}</span>
                          <span className="text-[10px] font-bold text-cyan-700 px-2 py-0.5 bg-cyan-50 rounded">{previewJob.category || 'PDF'}</span>
                        </div>
                        <div className="h-3 w-3/4 bg-slate-300 rounded"></div>
                        <div className="h-2 w-full bg-slate-200 rounded"></div>
                        <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                        <div className="h-2 w-full bg-slate-200 rounded"></div>
                        <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                      </div>

                      <div className="my-auto py-8 text-center">
                        <FileText className="w-12 h-12 text-cyan-600 mx-auto mb-2 opacity-80" />
                        <p className="font-bold text-slate-900 text-xs">{previewJob.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Firebase Document Storage Verified</p>
                      </div>

                      <div className="border-t pt-2 border-slate-200 flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>CONFIDENTIAL DOCUMENT</span>
                        <span>INSTANT PRINT SECURE</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/4] w-full max-w-sm bg-white border border-slate-300 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                      <span className="font-mono text-[10px] text-slate-400">DOCUMENT PREVIEW</span>
                      <span className="text-[10px] font-bold text-violet-700 px-2 py-0.5 bg-violet-50 rounded">{previewJob.category || 'PDF'}</span>
                    </div>
                    <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                  </div>

                  <div className="py-6 text-center">
                    <Printer className="w-10 h-10 text-violet-600 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-slate-900 text-xs">{previewJob.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{previewJob.pages} Page(s) • {previewJob.mode}</p>
                  </div>

                  <div className="border-t pt-2 border-slate-200 flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>{previewJob.date || previewJob.time}</span>
                    <span>{previewJob.cost}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Cost: <span className="font-bold text-slate-900">{previewJob.cost}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    audioFX.playButtonClick();
                    setPreviewJob(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Close Preview
                </button>

                <button
                  onClick={() => {
                    audioFX.playButtonClick();
                    alert(`Printing document "${previewJob.name}" for user ${previewJob.phone}!`);
                    setPreviewJob(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating User Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden relative"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-6 text-white relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 border-2 border-white/20 flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white truncate">{user?.name || 'Master Administrator'}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[10px] font-bold shrink-0">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300 font-mono mt-0.5 truncate">{user?.phone || '+91 8247806042'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider">
                    {user?.role || 'System Admin'} • Root Privileges
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-4 text-xs">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Account ID:</span>
                  <span className="font-mono font-bold text-slate-900">ADM-806042-SYS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Authentication Method:</span>
                  <span className="font-bold text-cyan-700">6-Digit Admin Master PIN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Active Kiosk Terminal:</span>
                  <span className="font-bold text-slate-900">Terminal #402</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Security Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified System Admin Session
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total System Jobs</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">{activeJobs.length} Orders</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Logged Sessions</span>
                  <span className="text-lg font-black text-cyan-700 mt-0.5 block">{activeLogs.length} Active</span>
                </div>
              </div>

              {/* Change Security PIN / Password Section */}
              <div className="pt-2 border-t border-slate-100">
                {!showChangePin ? (
                  <button
                    onClick={() => {
                      audioFX.playButtonClick();
                      setShowChangePin(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-bold text-xs transition-colors"
                  >
                    <Lock className="w-4 h-4 text-violet-600" />
                    <span>Change Security PIN / Password</span>
                  </button>
                ) : (
                  <form onSubmit={handleChangePinSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-violet-600" />
                        Change 6-Digit PIN
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowChangePin(false)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    {pinMessage && (
                      <div className={`p-2 rounded-lg text-[11px] font-semibold ${
                        pinMessage.includes('successfully')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {pinMessage}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Current PIN</label>
                      <input
                        type="password"
                        maxLength={8}
                        placeholder="Enter current PIN..."
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New 6-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={8}
                        placeholder="Enter new 6-digit PIN..."
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirm New PIN</label>
                      <input
                        type="password"
                        maxLength={8}
                        placeholder="Confirm new PIN..."
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPin}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSavingPin ? 'Saving to Firebase...' : 'Update & Encrypt Security PIN'}
                    </button>
                  </form>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    audioFX.playButtonClick();
                    setShowProfileModal(false);
                    setActiveTab('user-logs');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 font-bold text-xs transition-colors"
                >
                  <Users className="w-4 h-4 text-cyan-600" />
                  <span>View User Sessions Audit Log</span>
                </button>

                <button
                  onClick={() => {
                    audioFX.playButtonClick();
                    setShowProfileModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Close Profile Details
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
