import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Image, FileCode, CheckCircle, Sparkles, File, Plus } from 'lucide-react';
import { analyzeDocumentWithAI } from '../utils/aiPredictor';
import { audioFX } from '../utils/audioFX';

const DocumentUploader = ({ onDocumentsProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    audioFX.playButtonClick();
    setIsAnalyzing(true);

    const fileList = Array.from(files);
    const processedResults = [];

    for (const f of fileList) {
      const aiData = await analyzeDocumentWithAI(f);
      processedResults.push({
        id: Math.random().toString(36).substr(2, 9),
        rawFile: f,
        ...aiData,
      });
    }

    setIsAnalyzing(false);
    onDocumentsProcessed(processedResults);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Demo sample file generators for 1-click testing
  const handleLoadSample = (sampleType) => {
    let mockFile;
    if (sampleType === 'academic') {
      mockFile = new File(['Sample Academic Thesis Document Content'], 'Computer_Vision_Thesis_Final.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 2.8 * 1024 * 1024 });
    } else if (sampleType === 'contract') {
      mockFile = new File(['Sample Legal NDA Contract Text'], 'Software_Licensing_Agreement_NDA.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      Object.defineProperty(mockFile, 'size', { value: 0.9 * 1024 * 1024 });
    } else {
      mockFile = new File(['Sample Passport Photo Data'], 'National_Identity_Card_Scan.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1.4 * 1024 * 1024 });
    }
    processFiles([mockFile]);
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6">
      
      {/* Title Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900">Document Dumping Ground</h2>
        <p className="text-sm text-slate-500 mt-1">
          Drag & drop PDF, Word, PowerPoint, or Image files. AI will automatically inspect & categorize.
        </p>
      </div>

      {/* Main Drag and Drop Dump Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        className={`relative cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-cyan-500 bg-cyan-50 scale-102 shadow-2xl shadow-cyan-500/20'
            : 'border-slate-300 hover:border-cyan-500/70 bg-white shadow-xl shadow-slate-200/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => processFiles(e.target.files)}
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt"
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin mb-4"></div>
            <p className="font-bold text-slate-900 text-lg">AI Document Inspection in Progress...</p>
            <p className="text-xs text-slate-500 mt-1">Estimating page counts, color pages, and paper requirements</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 mb-5 shadow-md">
              <UploadCloud className="w-10 h-10 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Drop Files Here or <span className="text-cyan-600 underline decoration-dashed">Browse</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              Supports PDF, DOCX, PPTX, PNG, JPG up to 50MB per document
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600">
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-600" /> PDF / Office
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-violet-600" /> High-Res Photos
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Auto AI Classifier
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Preset Demo Files Bar for 1-Click Instant Testing */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
          Or Load Instant Test Document Presets:
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => handleLoadSample('academic')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-cyan-500 text-slate-800 text-xs font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <FileText className="w-4 h-4 text-cyan-600" />
            <span>Academic Thesis (12 pgs PDF)</span>
          </button>

          <button
            onClick={() => handleLoadSample('contract')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-violet-500 text-slate-800 text-xs font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <FileCode className="w-4 h-4 text-violet-600" />
            <span>Legal NDA Contract (6 pgs DOCX)</span>
          </button>

          <button
            onClick={() => handleLoadSample('photo')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 text-xs font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Image className="w-4 h-4 text-emerald-600" />
            <span>ID Card Scan (1 pg Photo)</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default DocumentUploader;
