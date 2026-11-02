import { Shield } from 'lucide-react';

export default function LoadingSpinner({ text = 'Analyzing...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div className="relative w-20 h-20">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
        {/* Rotating gradient ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-blue-500 animate-spin"></div>
        {/* Inner static border */}
        <div className="absolute inset-2 rounded-full border border-white/10 bg-[#0d1635]/80 flex items-center justify-center">
          <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-slate-200 tracking-wide">{text}</p>
        <p className="text-xs text-slate-500">Checking patterns & threat intelligence...</p>
      </div>
    </div>
  );
}

