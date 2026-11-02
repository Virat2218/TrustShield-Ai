import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  UploadCloud,
  FileImage,
  Trash2,
  Send,
  AlertCircle,
  FileText,
  Info,
  CheckCircle,
} from 'lucide-react';
import { analyzeScreenshot } from '../services/api';
import RiskReport from '../components/RiskReport';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

export default function ScreenshotAnalyzer() {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(t.errors.fileTooLarge);
      return;
    }

    setError('');
    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(t.errors.noFile);
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeScreenshot(selectedFile);
      setResult(data);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        (err.code === 'ERR_NETWORK' ? t.errors.network : t.errors.serverError);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5" />
          <span>Optical Character Recognition &amp; Scam Detection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.screenshotAnalyzer.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          {t.screenshotAnalyzer.subtitle}
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="relative rounded-3xl bg-[#0d1635]/70 backdrop-blur-md border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/40">
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                : 'border-white/20 hover:border-cyan-500/50 hover:bg-white/[0.02]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => validateAndSetFile(e.target.files[0])}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">
                {t.screenshotAnalyzer.dropzone}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t.screenshotAnalyzer.formats}
              </p>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition"
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview Card */}
            <div className="relative rounded-2xl bg-black/40 border border-white/10 p-4 flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
              <div className="w-full sm:w-48 h-48 rounded-xl bg-black/60 border border-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <FileImage className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Ready for OCR &amp; AI Security Analysis</span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.screenshotAnalyzer.removeImage}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>{t.screenshotAnalyzer.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.screenshotAnalyzer.analyze}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center space-x-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      {loading && <LoadingSpinner text={t.screenshotAnalyzer.analyzing} />}

      {/* Extracted Text & Risk Report */}
      {result && (
        <div className="space-y-6">
          {/* Extracted OCR Text Display */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <FileText className="w-4 h-4" />
              <span>{t.screenshotAnalyzer.extractedText}</span>
            </div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-xl border border-white/5 max-h-48 overflow-y-auto leading-relaxed">
              {result.extracted_text}
            </pre>
          </div>

          <RiskReport
            result={result}
            type="screenshot"
            onReset={handleRemoveImage}
            submittedContent={result.extracted_text}
          />
        </div>
      )}
    </div>
  );
}

