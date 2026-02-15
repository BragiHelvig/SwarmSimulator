import { motion } from 'framer-motion'
import { useSimulation } from '@/store/useSimulationStore'

const SPEED_PRESETS = [0, 0.25, 0.5, 1, 2, 5, 10, 20]

export function TimeControls() {
  const { state, dispatch } = useSimulation()
  const { paused, timeScale } = state

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 z-10 flex items-center gap-2 pointer-events-none"
    >
      <div className="backdrop-blur-xl bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 flex items-center gap-3 font-mono text-sm pointer-events-auto">
        <button
          onClick={() => dispatch({ type: 'SET_PAUSED', payload: !paused })}
          className={`px-3 py-1 rounded transition-all ${
            paused ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
          }`}
        >
          {paused ? '▶ PLAY' : '⏸ PAUSE'}
        </button>
        <div className="h-4 w-px bg-slate-600" />
        <div className="flex gap-1">
          {SPEED_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_TIME_SCALE', payload: s })}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                timeScale === s ? 'bg-cyan-500/40 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s === 0 ? '0' : `${s}x`}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
