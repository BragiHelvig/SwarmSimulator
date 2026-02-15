import { motion } from 'framer-motion'
import { useSimulation } from '@/store/useSimulationStore'

export function CameraModeToggle() {
  const { state, dispatch } = useSimulation()
  const { cameraMode, selectedNodeId } = state

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 right-4 z-10 flex gap-2 pointer-events-none"
    >
      <button
        onClick={() => dispatch({ type: 'SET_CAMERA_MODE', payload: 'free' })}
        className={`px-4 py-2 rounded-lg font-mono text-sm transition-all backdrop-blur-xl pointer-events-auto ${
          cameraMode === 'free'
            ? 'bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50'
            : 'bg-black/40 text-slate-400 border border-white/10 hover:border-cyan-500/30'
        }`}
      >
        Free Cam
      </button>
      <button
        onClick={() => selectedNodeId != null && dispatch({ type: 'SET_CAMERA_MODE', payload: 'node-eye' })}
        disabled={selectedNodeId == null}
        className={`px-4 py-2 rounded-lg font-mono text-sm transition-all backdrop-blur-xl pointer-events-auto ${
          cameraMode === 'node-eye'
            ? 'bg-neon-amber/30 text-neon-amber border border-neon-amber/50'
            : selectedNodeId == null
            ? 'bg-black/20 text-slate-600 border border-white/5 cursor-not-allowed'
            : 'bg-black/40 text-slate-400 border border-white/10 hover:border-amber-500/30'
        }`}
      >
        Node View
      </button>
    </motion.div>
  )
}
