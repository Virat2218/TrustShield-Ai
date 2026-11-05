import { Link } from 'react-router-dom';
import { ShieldAlert, Home, Search, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[65vh] max-w-2xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
        <ShieldAlert className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200">
          Error 404 &bull; Page Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight pt-2">
          This security route doesn't exist
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          The link you followed may be broken or the security advisory page may have moved.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white text-xs font-bold transition shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Go to Homepage</span>
        </Link>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition"
        >
          <Search className="w-4 h-4" />
          <span>Message Scanner</span>
        </Link>
        <Link
          to="/alerts"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition"
        >
          <Radio className="w-4 h-4" />
          <span>Threat Advisories</span>
        </Link>
      </div>
    </div>
  );
}

