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
  CheckCircle,
} from 'lucide-react';
import { analyzeScreenshot } from '../services/api';
import RiskReport from '../components/RiskReport';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ScreenshotAnalyzer() {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file format. Please upload a PNG, JPEG, or WEBP image.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
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

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
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
      const msg =
        err.response?.data?.detail ||
        (err.code === 'ERR_NETWORK' ? t.errors.network : t.errors.serverError);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">

      {/* Page header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#0d766e] text-xs font-bold uppercase tracking-wider">
          <Camera className="w-4 h-4" aria-hidden="true" />
          <span>Screenshot Analyzer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Analyze a Screenshot for Scam Signs
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl">
          Upload a screenshot of any message, payment confirmation, or chat. Optical character
          recognition (OCR) extracts the text for automated scam analysis.
        </p>
      </header>

      {/* Upload area */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-5">

        {!previewUrl ? (
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Select or drop an image
            </label>

            <input
              type="file"
              ref={fileInputRef}
              id="screenshot-upload"
              onChange={(e) => validateAndSetFile(e.target.files[0])}
              accept={ALLOWED_TYPES.join(',')}
              className="sr-only"
            />

            <label
              htmlFor="screenshot-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#0d766e] bg-teal-50/50'
                  : 'border-slate-300 hover:border-[#0d766e] hover:bg-slate-50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0d766e]">
                <UploadCloud className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {t.screenshotAnalyzer.dropzone}
                </p>
                <p className="text-xs text-slate-500">
                  PNG, JPEG, WEBP up to {MAX_SIZE_MB}&thinsp;MB
                </p>
              </div>
              <span className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-200 transition">
                Browse Files
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-40 h-40 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <FileImage className="w-4 h-4 text-[#0d766e]" aria-hidden="true" />
                  <span className="text-sm font-bold text-slate-900 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)}&thinsp;MB &bull; {selectedFile.type}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-emerald-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Ready for OCR extraction and risk analysis
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Remove image</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Extracting &amp; analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Analyze Screenshot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && <LoadingSpinner text="Extracting text with OCR..." />}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <section>
            <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0d766e]">
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Extracted Text from Image</span>
              </div>
              {result.extracted_text ? (
                <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-48 overflow-y-auto leading-relaxed">
                  {result.extracted_text}
                </pre>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No text could be extracted from this image.
                </p>
              )}
            </div>
          </section>

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
