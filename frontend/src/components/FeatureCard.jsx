import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, badge }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative p-6 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all group overflow-hidden shadow-lg shadow-black/40"
    >
      {/* Top subtle glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-gradient-to-br from-blue-500/10 to-cyan-500/20 rounded-full blur-2xl group-hover:scale-150 transition duration-500 pointer-events-none"></div>

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400/60 group-hover:bg-cyan-500/10 transition">
          <Icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition duration-300" />
        </div>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            {badge}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition">
        {title}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

