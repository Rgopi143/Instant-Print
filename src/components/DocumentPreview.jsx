import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Trash2, CheckCircle2, ArrowRight, Layers, Sliders, AlertCircle, Plus } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const DocumentPreview = ({ documents, onRemoveDocument, onAddMore, onProceedToConfig }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 truncate">
              AI Document Analysis
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 text-xs font-semibold shrink-0">
              {documents.length} File{documents.length > 1 ? 's' : ''} Ready
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 truncate sm:whitespace-normal">
            Review AI categorized details before configuring print options.
          </p>
        </div>

        <button
          onClick={() => {
            audioFX.playButtonClick();
            onAddMore();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors shadow-sm shrink-0 whitespace-nowrap"
          title="Add More Files"
          aria-label="Add More Files"
        >
          <Plus className="w-4 h-4 text-cyan-600 shrink-0" />
          <span className="hidden sm:inline">Add More Files</span>
        </button>
      </div>

      {/* Document Cards List */}
      <div className="space-y-4 mb-8">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-cyan-500/50 transition-all overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Document Icon & Name */}
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base break-all sm:break-normal truncate" title={doc.fileName}>
                    {doc.fileName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-mono font-medium shrink-0">
                      {doc.fileSizeFormatted}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-violet-600" />
                      {doc.category}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold shrink-0">
                      {doc.confidence}% AI Confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  audioFX.playButtonClick();
                  onRemoveDocument(doc.id);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors shrink-0 self-end sm:self-center"
                title="Remove Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Page Count breakdown bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">TOTAL PAGES</span>
                <span className="text-base font-bold text-slate-900">{doc.estimatedPages} Pages</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">COLOR / B&W ESTIMATE</span>
                <span className="text-sm font-bold text-slate-800">
                  <span className="text-cyan-600">{doc.colorPagesCount} Color</span> • <span className="text-slate-600">{doc.bwPagesCount} B&W</span>
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">RECOMMENDED PAPER</span>
                <span className="text-sm font-bold text-emerald-700">{doc.recommendedPaper}</span>
              </div>
            </div>

            {/* AI Advice Callout */}
            {doc.aiAdvice && (
              <div className="mt-3 p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="break-words">{doc.aiAdvice}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Proceed Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            audioFX.playButtonClick();
            onProceedToConfig();
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:opacity-95 text-white font-black text-base shadow-xl shadow-cyan-600/20 transition-all active:scale-95"
        >
          <Sliders className="w-5 h-5" />
          <span>Configure Print Settings</span>
        </button>
      </div>

    </div>
  );
};

export default DocumentPreview;
