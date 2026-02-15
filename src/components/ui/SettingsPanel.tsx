import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulation } from '@/store/useSimulationStore'

export function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const { state, dispatch } = useSimulation()
  const { settings } = state

  const toggles: { key: keyof typeof settings; label: string }[] = [
    { key: 'showPlanetLabels', label: 'Planet Labels' },
    { key: 'showOrbitalTrails', label: 'Orbital Trails' },
    { key: 'showCoordinateGrid', label: 'Coordinate Grid' },
    { key: 'showAsteroidBelt', label: 'Asteroid Belt' },
    { key: 'showLagrangePoints', label: 'Lagrange Points' },
    { key: 'showProximityAlerts', label: 'Proximity Alerts' },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-[calc(400px+1.5rem)] max-md:left-4 max-md:bottom-20 z-10 px-3 py-2 rounded-lg backdrop-blur-xl bg-black/50 border border-slate-600/50 text-slate-400 hover:text-slate-200 font-mono text-xs transition-all pointer-events-auto"
      >
        ⚙ SETTINGS
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-14 left-4 z-20 w-56 backdrop-blur-xl bg-black/70 border border-slate-600/50 rounded-lg p-3 font-mono text-sm"
          >
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">Display Options</div>
            <div className="space-y-2">
              {toggles.map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="text-slate-300 text-xs">{label}</span>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { [key]: e.target.checked } })}
                    className="rounded accent-cyan-500"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={() => dispatch({ type: 'START_FROM_SCRATCH' })}
              className="mt-3 w-full py-1.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
            >
              Start from Scratch
            </button>
            <button
              onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
              className="mt-2 w-full py-1.5 rounded text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
            >
              Reset Simulation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
