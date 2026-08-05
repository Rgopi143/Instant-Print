import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  UploadCloud, 
  FileText, 
  Printer, 
  Clock, 
  CheckCircle2, 
  Zap, 
  LogOut, 
  TrendingUp, 
  Award, 
  RefreshCw,
  Search,
  Download,
  CreditCard,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Filter,
  FileCode,
  Image,
  HardDrive,
  X,
  Eye,
  Database
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';
import { subscribeUserOrders } from '../firebase/firestoreService';

const CustomerDashboard = ({ user, onExit, onProceedUpload }) => {
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [notification, setNotification] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);
  
  // Real-time Firebase Orders state
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = subscribeUserOrders(user?.phone, (liveOrders) => {
      setOrders(liveOrders);
    });
    return () => unsub();
  }, [user?.phone]);

  const activeOrders = orders;

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredHistory = activeOrders.filter(ord => {
    const nameMatch = ord.name ? ord.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const idMatch = (ord.orderId || ord.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || idMatch;
    const matchesCategory = categoryFilter === 'All' || ord.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPagesCount = activeOrders.reduce((acc, curr) => acc + (Number(curr.pages) || 1), 0);
  const totalAmountPaid = activeOrders.reduce((acc, curr) => {
    const val = parseFloat((curr.cost || '0').toString().replace('₹', '')) || 0;
    return acc + val;
  }, 0);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* File Preview Overlay Modal */}
      {previewOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-800 shadow-2xl p-6 relative flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{previewOrder.name}</h3>
                  <p className="text-xs text-slate-400">{previewOrder.orderId || previewOrder.id} • {previewOrder.mode} ({previewOrder.pages} pages)</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewOrder(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Sheet Viewer Canvas */}
            <div className="flex-1 overflow-y-auto py-6 flex items-center justify-center bg-slate-950/50 rounded-2xl my-4 border border-slate-800/80">
              <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 min-h-[420px] relative text-slate-800 flex flex-col justify-between select-none">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                    <div className="h-6 w-32 bg-slate-200 rounded-md animate-pulse"></div>
                    <span className="text-[10px] font-mono text-slate-400">PAGE 1 OF {previewOrder.pages}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-5 w-3/4 bg-slate-800 rounded font-bold text-xs flex items-center px-2 text-white">
                      {previewOrder.name.replace('.pdf', '').replace('.docx', '').replaceAll('_', ' ')}
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded"></div>
                    <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
                    <div className="h-3 w-4/6 bg-slate-200 rounded"></div>
                    
                    <div className="pt-4 space-y-2">
                      <div className="h-3 w-full bg-slate-100 rounded"></div>
                      <div className="h-3 w-11/12 bg-slate-100 rounded"></div>
                      <div className="h-3 w-4/5 bg-slate-100 rounded"></div>
                      <div className="h-3 w-full bg-slate-100 rounded"></div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <div className="h-16 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400 text-center p-2">
                        INSTANT PRINT WATERMARK
                      </div>
                      <div className="h-16 bg-cyan-50 rounded-lg border border-cyan-200 flex flex-col items-center justify-center text-[9px] font-bold text-cyan-700">
                        <span>PRINTED COPIES</span>
                        <span className="text-xs font-black">{previewOrder.pages} PAGES</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>CONFIDENTIAL OUTPUT</span>
                  <span>{previewOrder.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                High-Resolution Document Preview
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    audioFX.playButtonClick();
                    setPreviewOrder(null);
                    setSelectedOrder(null);
                    onProceedUpload();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Re-Print Now</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-cyan-700">{selectedOrder.orderId || selectedOrder.id}</span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedOrder.name}</h3>
              </div>
            </div>

            <div className="space-y-4 py-4 border-y border-slate-100">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PRINT SPECIFICATIONS</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-xs">
                    {selectedOrder.mode}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-bold text-xs">
                    {selectedOrder.pages} Page{selectedOrder.pages > 1 ? 's' : ''}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                    {selectedOrder.category || 'PDF'} Format
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Date & Time</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedOrder.date}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Paid</span>
                  <span className="font-black text-emerald-700 mt-0.5 block">{selectedOrder.cost}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedOrder.status || 'Completed'}
                  </span>
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  audioFX.playButtonClick();
                  setPreviewOrder(selectedOrder);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-bold text-xs transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Preview File</span>
              </button>

              <button
                onClick={() => {
                  audioFX.playButtonClick();
                  showNotification(`Official receipt downloaded for ${selectedOrder.orderId || selectedOrder.id}`);
                  setSelectedOrder(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>

              <button
                onClick={() => {
                  audioFX.playButtonClick();
                  setSelectedOrder(null);
                  onProceedUpload();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Re-Print File</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* VIEW MODE 1: DEDICATED PRINT HISTORY VIEW */}
      {viewMode === 'history' ? (
        <>
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => {
                audioFX.playButtonClick();
                setViewMode('dashboard');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-800 hover:text-cyan-900 font-bold text-xs shadow-md transition-all active:scale-95 group"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-600 group-hover:-translate-x-1 transition-transform" />
              <span>Return to Dashboard</span>
            </button>

            <button
              onClick={() => {
                audioFX.playButtonClick();
                onProceedUpload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload & Print New File</span>
            </button>
          </div>

          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </motion.div>
          )}

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900">Complete Print History & Activity Logs</h1>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Detailed audit trail for all your past document printing orders.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 px-3">{activeOrders.length} Total Orders</span>
                <span className="px-3 py-1 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-sm">
                  {totalPagesCount} Pages Printed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Completed Jobs</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{activeOrders.length} Print Jobs</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Pages Output</div>
                <div className="text-lg font-black text-cyan-700 mt-0.5">{totalPagesCount} Pages</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Amount Paid</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">₹{totalAmountPaid.toFixed(2)}</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Dispense Time</div>
                <div className="text-lg font-black text-violet-700 mt-0.5">38 Seconds</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search file name or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {['All', 'PDF', 'Photo', 'DOCX'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Document Name</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => {
                          audioFX.playButtonClick();
                          setSelectedOrder(item);
                        }}
                        className="hover:bg-cyan-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 font-bold font-mono text-cyan-700 group-hover:underline">{item.orderId || item.id}</td>
                        <td className="py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            {item.category === 'Photo' ? (
                              <Image className="w-4 h-4 text-violet-600 shrink-0" />
                            ) : item.category === 'DOCX' ? (
                              <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                            )}
                            <span className="truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-500 font-medium">{item.date}</td>
                        <td className="py-4 font-black text-slate-900">{item.cost}</td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600" title={item.status || 'Completed'}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Database className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600 text-sm">No print history found</p>
                          <p className="text-xs text-slate-400">Upload a document to print to create your first order.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      ) : (
        /* VIEW MODE 2: DASHBOARD OVERVIEW VIEW */
        <>
          {/* Customer Header */}
          <header className="w-full bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 mb-6 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 border border-cyan-400/30 flex items-center justify-center text-white shadow-md shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-lg leading-tight">
                    {(() => {
                      const hour = new Date().getHours();
                      const greeting = hour >= 5 && hour < 12 ? 'Good Morning' : hour >= 12 && hour < 17 ? 'Good Afternoon' : hour >= 17 && hour < 22 ? 'Good Evening' : 'Good Night';
                      const displayName = user?.name ? user.name : (user?.phone || 'Customer');
                      return `${greeting}, ${displayName}!`;
                    })()}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                    Verified Account
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user?.name && user?.phone ? `${user.phone} • ` : ''}Instant Print Customer Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  audioFX.playButtonClick();
                  onProceedUpload();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload New Document</span>
              </button>

              <button
                title="Logout Session"
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            
            {/* Total Prints */}
            <div 
              onClick={() => {
                audioFX.playButtonClick();
                setViewMode('history');
              }}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-cyan-500 shadow-lg shadow-slate-200/50 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-cyan-600 transition-colors">TOTAL PRINTS</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 group-hover:bg-cyan-600 group-hover:text-white flex items-center justify-center text-cyan-600 transition-all">
                  <Printer className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors">{totalPagesCount} Pages</div>
                <p className="text-[11px] text-cyan-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>{activeOrders.length} print jobs completed</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>

            {/* Instant Upload CTA Box */}
            <div 
              onClick={() => {
                audioFX.playButtonClick();
                onProceedUpload();
              }}
              className="bg-gradient-to-tr from-cyan-600 to-violet-600 p-4 sm:p-5 rounded-2xl border border-cyan-400/30 text-white shadow-lg shadow-cyan-600/20 flex flex-col justify-between cursor-pointer hover:opacity-95 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-100">QUICK ACTION</span>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black leading-tight">Start Printing Now</div>
                <p className="text-[11px] text-cyan-100 mt-0.5">Drop files to print instantly</p>
              </div>
            </div>

            {/* Wallet / Savings */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">SAVINGS & SPEND</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">₹{totalAmountPaid.toFixed(2)}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Saved ₹24.00 with promo</p>
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">LOYALTY REWARDS</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">120 Pts</div>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Silver Tier Member</p>
              </div>
            </div>

          </div>

          {/* Main Section Card: Print History & Documents */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  <span>Your Recent Print Jobs</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Track your printing history and download receipts</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by file name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={() => {
                    audioFX.playButtonClick();
                    setViewMode('history');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Overview Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Document Name</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.slice(0, 5).map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => {
                          audioFX.playButtonClick();
                          setSelectedOrder(order);
                        }}
                        className="hover:bg-cyan-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 font-bold font-mono text-cyan-700 group-hover:underline">{order.orderId || order.id}</td>
                        <td className="py-4 font-semibold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{order.name}</span>
                        </td>
                        <td className="py-4 text-slate-500">{order.date}</td>
                        <td className="py-4 font-bold text-slate-900">{order.cost}</td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600" title={order.status || 'Completed'}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Database className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600 text-sm">No recent print jobs found</p>
                          <p className="text-xs text-slate-400">Upload a document to print to create your first order.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default CustomerDashboard;
