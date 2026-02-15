import { motion, AnimatePresence } from 'framer-motion'
import { useSimulation } from '@/store/useSimulationStore'

export function AlertsPanel() {
  const { state, dispatch } = useSimulation()
  const { alerts, settings } = state

  const activeAlerts = alerts.filter(a => !a.acknowledged)

  if (!settings.showProximityAlerts && activeAlerts.length === 0) return null

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-1 max-w-md pointer-events-none">
      <AnimatePresence>
        {activeAlerts.slice(-3).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`backdrop-blur-xl rounded-lg px-3 py-2 flex items-center justify-between gap-2 font-mono text-xs pointer-events-auto ${
              (alert.type === 'proximity' || alert.type === 'warning') ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' :
              alert.type === 'system' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' :
              'bg-slate-800/80 border border-slate-600/50 text-slate-300'
            }`}
          >
            <span>{alert.message}</span>
            <button
              onClick={() => dispatch({ type: 'ACK_ALERT', payload: alert.id })}
              className="text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
