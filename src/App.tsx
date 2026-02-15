import { useEffect, useRef } from 'react'
import { SimulationProvider } from '@/store/useSimulationStore'
import { Scene } from '@/components/Scene'
import { ControlHUD } from '@/components/ui/ControlHUD'
import { EnergyGraph } from '@/components/ui/EnergyGraph'
import { CameraModeToggle } from '@/components/ui/CameraModeToggle'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const canvas = containerRef.current.querySelector('canvas')
    if (!canvas) return
    const canvasParent = canvas.parentElement
    const canvasGrandparent = canvasParent?.parentElement
    if (canvasGrandparent && canvasParent) {
      canvasGrandparent.insertBefore(canvas, canvasParent)
      Object.assign((canvas as HTMLCanvasElement).style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
      })
    }
  }, [])

  return (
    <SimulationProvider>
      <div ref={containerRef} className="w-full h-full relative">
        <Scene />
        <ControlHUD />
        <EnergyGraph />
        <CameraModeToggle />
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 font-mono text-xs text-slate-500/80 tracking-widest">
          DYSON SWARM COMMAND — Select a collector to assume pilot control
        </div>
      </div>
    </SimulationProvider>
  )
}

export default App
