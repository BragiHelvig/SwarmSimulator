import { SimulationProvider } from '@/store/useSimulationStore'
import { Scene } from '@/components/Scene'
import { ControlHUD } from '@/components/ui/ControlHUD'
import { EnergyGraph } from '@/components/ui/EnergyGraph'
import { CameraModeToggle } from '@/components/ui/CameraModeToggle'
import { TimeControls } from '@/components/ui/TimeControls'
import { SettingsPanel } from '@/components/ui/SettingsPanel'
import { AlertsPanel } from '@/components/ui/AlertsPanel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function AppContent() {
  useKeyboardShortcuts()

  return (
    <div className="w-full h-full relative">
      <Scene />
      <ControlHUD />
      <EnergyGraph />
      <CameraModeToggle />
      <TimeControls />
      <SettingsPanel />
      <AlertsPanel />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 font-mono text-xs text-slate-500/80 tracking-widest pointer-events-none">
        DYSON SWARM COMMAND — Space: Pause | V: Node View | Esc: Deselect
      </div>
    </div>
  )
}

function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  )
}

export default App
