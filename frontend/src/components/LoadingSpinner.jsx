export default function LoadingSpinner({ text = 'Analyzing...' }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 space-y-5"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      {/* Spinner ring */}
      <div
        className="w-12 h-12 rounded-full border-[3px] border-slate-700 border-t-cyan-400 motion-safe:animate-spin"
        aria-hidden="true"
      />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-slate-200">{text}</p>
        <p className="text-xs text-slate-500">Checking patterns and indicators…</p>
      </div>
    </div>
  );
}
