export default function LoadingSpinner({ text = 'Analyzing...' }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 space-y-4"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div
        className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-[#0d766e] animate-spin"
        aria-hidden="true"
      />
      <div className="text-center space-y-0.5">
        <p className="text-sm font-bold text-slate-800">{text}</p>
        <p className="text-xs text-slate-500">Evaluating safety indicators and patterns…</p>
      </div>
    </div>
  );
}
