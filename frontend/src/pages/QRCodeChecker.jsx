import { useState, useRef } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Upload,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Info,
  RotateCcw,
} from 'lucide-react';
import { analyzeUrl } from '../services/api';

export default function QRCodeChecker() {
  const [imagePreview, setImagePreview] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [decodingError, setDecodingError] = useState(null);
  const [urlAnalysis, setUrlAnalysis] = useState(null);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setDecodingError(null);
    setQrData(null);
    setUrlAnalysis(null);

    if (!file.type.startsWith('image/')) {
      setDecodingError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      setImagePreview(src);
      decodeImage(src);
    };
    reader.readAsDataURL(file);
  };

  const decodeImage = (imageSrc) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        parseDecodedData(code.data);
      } else {
        setDecodingError(
          'No readable QR code found in this image. Please ensure the QR code is clear, well-lit, and not cropped.'
        );
      }
    };
    img.onerror = () => {
      setDecodingError('Failed to load image. Please try another file.');
    };
    img.src = imageSrc;
  };

  const parseDecodedData = (rawText) => {
    const trimmed = rawText.trim();
    let type = 'text';
    let upiDetails = null;

    if (trimmed.startsWith('upi://pay')) {
      type = 'upi';
      try {
        const urlObj = new URL(trimmed);
        upiDetails = {
          pa: urlObj.searchParams.get('pa') || 'Unknown VPA',
          pn: urlObj.searchParams.get('pn') || 'Unknown Payee',
          am: urlObj.searchParams.get('am') || null,
          cu: urlObj.searchParams.get('cu') || 'INR',
          tn: urlObj.searchParams.get('tn') || '',
        };
      } catch {
        upiDetails = { pa: 'Manual check required', pn: 'Unknown' };
      }
    } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      type = 'url';
    }

    setQrData({
      raw: trimmed,
      type,
      upiDetails,
    });
  };

  const handleAnalyzeUrl = async () => {
    if (!qrData || qrData.type !== 'url') return;
    setAnalyzingUrl(true);
    try {
      const result = await analyzeUrl(qrData.raw);
      setUrlAnalysis(result);
    } catch {
      setUrlAnalysis({
        risk_level: 'High',
        risk_score: 85,
        summary: 'Unable to reach threat database; treat unfamiliar QR links with extreme caution.',
        warning_signs: ['Link scan service currently unreachable or rate limited.'],
        recommendations: ['Do not enter passwords or banking OTPs on this website.'],
      });
    } finally {
      setAnalyzingUrl(false);
    }
  };

  const copyToClipboard = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setImagePreview(null);
    setQrData(null);
    setDecodingError(null);
    setUrlAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0d766e]">
            <QrCode className="w-4 h-4" />
            <span>Client-Side QR Safety Inspector</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            QR Code Safety Checker
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Inspect payment QR codes, stickers, and poster links before scanning them on your banking app. Decoding runs 100% locally in your browser.
          </p>
        </div>

        {/* Upload Box */}
        {!imagePreview && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#0d766e] bg-white rounded-3xl p-10 text-center cursor-pointer transition hover:shadow-md space-y-4"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0d766e] flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-900">
                Click to upload or drag & drop QR code image
              </p>
              <p className="text-xs text-slate-500">
                Supports PNG, JPG, WEBP screenshots or camera photos
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-[#0d766e]" />
              <span>Decoded on device — no images uploaded to any server</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {decodingError && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-rose-900">Decoding Notice</h3>
              <p className="text-xs text-rose-700">{decodingError}</p>
              <button
                type="button"
                onClick={resetAll}
                className="text-xs font-bold text-rose-800 underline hover:no-underline cursor-pointer"
              >
                Upload another image
              </button>
            </div>
          </div>
        )}

        {/* Results View */}
        {qrData && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="QR source thumbnail"
                  className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0d766e]">
                    Detected Format
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 capitalize">
                    {qrData.type === 'upi' ? 'UPI Payment QR Code' : qrData.type === 'url' ? 'Web Address (URL)' : 'Plain Text / Data'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Scan Another</span>
              </button>
            </div>

            {/* UPI Trap Warning Section */}
            {qrData.type === 'upi' && (
              <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-950 mb-1">
                      Critical UPI Safety Rule
                    </span>
                    <h3 className="text-base font-extrabold text-amber-950">
                      Scanning this QR code will DEBIT money from your account, not credit it.
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-900 leading-relaxed mt-1">
                      If someone sent this QR code claiming: <em>"Scan this to receive your cashback / refund / OLX payment / prize"</em>, <strong>this is 100% a scam</strong>. In UPI, receiving money NEVER requires scanning a QR code or entering your UPI PIN.
                    </p>
                  </div>
                </div>

                {/* Parsed UPI Details */}
                {qrData.upiDetails && (
                  <div className="bg-white/80 rounded-xl p-4 border border-amber-200 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 font-medium">Payee Name (pn):</span>
                        <p className="font-bold text-slate-900 text-sm">{qrData.upiDetails.pn}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Payee VPA / UPI ID (pa):</span>
                        <p className="font-mono font-bold text-slate-900">{qrData.upiDetails.pa}</p>
                      </div>
                      {qrData.upiDetails.am && (
                        <div>
                          <span className="text-slate-500 font-medium">Pre-filled Amount:</span>
                          <p className="font-bold text-rose-700 text-sm">
                            ₹{qrData.upiDetails.am} {qrData.upiDetails.cu}
                          </p>
                        </div>
                      )}
                      {qrData.upiDetails.tn && (
                        <div>
                          <span className="text-slate-500 font-medium">Note / Transaction Note:</span>
                          <p className="text-slate-700">{qrData.upiDetails.tn}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* URL QR Section */}
            {qrData.type === 'url' && (
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Target Web Destination
                    </span>
                    <p className="text-base font-mono font-bold text-slate-900 break-all">
                      {qrData.raw}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeUrl}
                    disabled={analyzingUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{analyzingUrl ? 'Analyzing URL Safety...' : 'Analyze Link Safety with TrustShield'}</span>
                  </button>
                </div>

                {/* URL Safety Result */}
                {urlAnalysis && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Threat Verdict</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          urlAnalysis.risk_level === 'Low'
                            ? 'bg-emerald-100 text-emerald-800'
                            : urlAnalysis.risk_level === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {urlAnalysis.risk_level} Risk ({urlAnalysis.risk_score}/100)
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {urlAnalysis.summary}
                    </p>
                    {urlAnalysis.warning_signs?.length > 0 && (
                      <ul className="text-xs text-rose-700 list-disc list-inside space-y-1">
                        {urlAnalysis.warning_signs.map((sign, i) => (
                          <li key={i}>{sign}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Plain Text QR */}
            {qrData.type === 'text' && (
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Decoded Payload Content
                  </span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 text-slate-800 font-mono text-xs whitespace-pre-wrap break-all border border-slate-100">
                  {qrData.raw}
                </pre>
              </div>
            )}

          </div>
        )}

        {/* Educational Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0d766e]" />
              <span>The "QR Payment Scam" Trap</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scammers list items on marketplaces or pretend to buy second-hand goods. They send a QR code claiming: <em>"Scan this in Google Pay / PhonePe to receive ₹10,000"</em>. Scanning it immediately prompts for your PIN to send ₹10,000 to the scammer.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0d766e]" />
              <span>Sticker Tampering (Quishing)</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Criminals paste fake QR stickers over authentic merchant QR codes at parking lots, restaurants, and fuel stations, redirecting payment or driving visitors to malicious APK download sites.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
