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
      setError('Unsupported file type. Please upload a PNG, JPEG, or WEBP image.');
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
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <Camera className="w-3.5 h-3.5" aria-hidden="true" />
          Screenshot Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.screenshotAnalyzer.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl">
          Upload a screenshot of a suspicious chat, payment confirmation, SMS, or email. We
          extract the text using OCR (Tesseract) and then analyse it for scam indicators.
        </p>
      </header>

      {/* Upload area */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 md:p-8 space-y-5">

        {!previewUrl ? (
          <>
            {/* Dropzone */}
            <div>
              <p className="text-sm font-medium text-slate-200 mb-3">
                Select or drag an image
              </p>

              {/* Hidden real input */}
              <input
                type="file"
                ref={fileInputRef}
                id="screenshot-upload"
                onChange={(e) => validateAndSetFile(e.target.files[0])}
                accept={ALLOWED_TYPES.join(',')}
                className="sr-only"
                aria-describedby="upload-hint"
              />

              {/* Visual dropzone — acts as label for the input */}
              <label
                htmlFor="screenshot-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors select-none ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/[0.07]'
                    : 'border-white/20 hover:border-white/30 hover:bg-white/[0.02]'
                }`}
                aria-label="Upload screenshot — click to browse or drag and drop"
              >
                <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7 text-slate-400" aria-hidden="true" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-white">
                    {t.screenshotAnalyzer.dropzone}
                  </p>
                  <p className="text-xs text-slate-500">
                    PNG, JPEG, WEBP — max {MAX_SIZE_MB}&thinsp;MB
                  </p>
                </div>
                <span className="px-5 py-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-sm font-semibold text-white border border-white/10 transition">
                  Browse files
                </span>
              </label>

              <p id="upload-hint" className="mt-2 text-xs text-slate-500">
                Uploaded images are processed for text extraction only and are not permanently stored.
              </p>
            </div>
          </>
        ) : (
          /* Preview card */
          <div className="space-y-5">
            <div className="rounded-xl bg-black/30 border border-white/[0.08] p-4 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-40 h-40 rounded-lg bg-black/40 border border-white/[0.05] overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview of your uploaded screenshot"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <FileImage className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)}&thinsp;MB &bull; {selectedFile.type}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Ready for OCR and analysis
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition"
                    aria-label="Remove uploaded image and start over"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.screenshotAnalyzer.removeImage}
                  </button>
                </div>
              </div>
            </div>

            {/* Analyze button */}
            <div className="flex justify-end pt-1 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-900/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                    {t.screenshotAnalyzer.analyzing}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    {t.screenshotAnalyzer.analyze}
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
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p>{error}</p>
                {error.toLowerCase().includes('unavailable') && (
                  <p className="mt-1 text-slate-400">
                    OCR may not be available on the deployment. Try the{' '}
                    <a href="/scan" className="underline text-cyan-400 hover:text-cyan-300">
                      Scam Detector
                    </a>{' '}
                    to paste the message text directly.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && <LoadingSpinner text={t.screenshotAnalyzer.analyzing} />}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Extracted text */}
          <section aria-labelledby="extracted-text-heading">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.07] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <FileText className="w-4 h-4" aria-hidden="true" />
                <h2 id="extracted-text-heading">{t.screenshotAnalyzer.extractedText}</h2>
              </div>
              {result.extracted_text ? (
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg border border-white/[0.05] max-h-48 overflow-y-auto leading-relaxed">
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
