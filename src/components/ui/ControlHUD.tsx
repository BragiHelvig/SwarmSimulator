import { motion, AnimatePresence } from 'framer-motion'
import { useSimulation } from '@/store/useSimulationStore'
import type { SwarmStructure } from '@/engine/orbitalPhysics'
import type { BurnMode } from '@/store/useSimulationStore'

const structureLabels: Record<SwarmStructure, string> = {
  ring: 'RING',
  shell: 'SHELL',
  swarm: 'SWARM',
}

const burnLabels: Record<BurnMode, string> = {
  hold: 'HOLD',
  raise: 'RAISE ORBIT',
  lower: 'LOWER ORBIT',
}

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function ControlHUD() {
  const { state, dispatch } = useSimulation()
  const {
    swarmStructure,
    nodeCount,
    baseRadius,
    timeScale,
    totalPower,
    selectedNodeId,
    nodes,
    nodeOverrides,
    commandLog,
    simTime,
    paused,
    energyStored,
    deploymentMode,
    deployedCount,
  } = state

  const selectedNode = selectedNodeId != null && nodes[selectedNodeId] ? nodes[selectedNodeId] : null
  const pilot = selectedNodeId != null ? (nodeOverrides[selectedNodeId] ?? { throttle: 100, attitudePitch: 0, attitudeYaw: 0, burnMode: 'hold' as BurnMode }) : null

  const logCommand = (msg: string, type: 'command' | 'status' | 'warning' | 'confirm' = 'command') => {
    dispatch({ type: 'LOG_COMMAND', payload: { timestamp: Date.now(), nodeId: selectedNodeId, message: msg, type } })
  }

  const setPilot = (updates: Partial<{ throttle: number; attitudePitch: number; attitudeYaw: number; burnMode: BurnMode }>) => {
    if (selectedNodeId == null) return
    dispatch({ type: 'SET_NODE_PILOT', payload: { nodeId: selectedNodeId, pilot: updates } })
  }

  const handleBurn = (mode: BurnMode) => {
    if (selectedNodeId == null) return
    setPilot({ burnMode: mode })
    logCommand(`Unit ${selectedNodeId}: Burn ${burnLabels[mode]}`, 'command')
  }

  const handleClearPilot = () => {
    if (selectedNodeId == null) return
    dispatch({ type: 'CLEAR_PILOT', payload: selectedNodeId })
    logCommand(`Unit ${selectedNodeId}: Pilot override cleared`, 'status')
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex">
      {/* Left: Fleet & Unit Control */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="pointer-events-auto w-80 flex flex-col gap-4 p-4"
      >
        {/* Fleet Overview */}
        <div className="backdrop-blur-xl bg-black/50 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/5 p-4 font-mono text-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
            <span className="text-cyan-400 text-xs uppercase tracking-widest">Fleet Overview</span>
            <span className="text-slate-500 text-xs flex items-center gap-2">
              SIM {formatTime(simTime)}
              {paused && <span className="text-amber-400">⏸</span>}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Structure</span>
              <span className="text-slate-200">{structureLabels[swarmStructure]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Collectors Online</span>
              <span className="text-emerald-400">
                {deploymentMode ? `${deployedCount.toLocaleString()} / ${nodeCount.toLocaleString()}` : nodeCount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Orbital Radius</span>
              <span className="text-slate-200">{baseRadius.toFixed(2)} AU</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Total Output</span>
              <span className="text-amber-400 font-semibold">{(totalPower / 1000).toFixed(2)} GW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Energy Stored</span>
              <span className="text-emerald-400">{(energyStored / 1000).toFixed(1)} GWh</span>
            </div>
          </div>
          {deploymentMode && (
            <div className="mt-3 pt-2 border-t border-cyan-500/20 space-y-2">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">Deployment</div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => dispatch({ type: 'LAUNCH_SATELLITES', payload: 1 })}
                  disabled={deployedCount >= nodeCount}
                  className="px-2 py-1 rounded text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Launch 1
                </button>
                <button
                  onClick={() => dispatch({ type: 'LAUNCH_SATELLITES', payload: 10 })}
                  disabled={deployedCount >= nodeCount}
                  className="px-2 py-1 rounded text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Launch 10
                </button>
                <button
                  onClick={() => dispatch({ type: 'LAUNCH_SATELLITES', payload: 100 })}
                  disabled={deployedCount >= nodeCount}
                  className="px-2 py-1 rounded text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Launch 100
                </button>
                <button
                  onClick={() => {
                    if (deployedCount < nodeCount) dispatch({ type: 'LAUNCH_SATELLITES', payload: nodeCount - deployedCount })
                    dispatch({ type: 'EXIT_DEPLOYMENT_MODE' })
                  }}
                  className="px-2 py-1 rounded text-[10px] bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/40 transition-all"
                >
                  Full Fleet
                </button>
              </div>
            </div>
          )}
          <div className="mt-3 pt-2 border-t border-cyan-500/20 flex gap-2">
            {(['ring', 'shell', 'swarm'] as SwarmStructure[]).map((s) => (
              <button
                key={s}
                onClick={() => dispatch({ type: 'SET_STRUCTURE', payload: s })}
                className={`flex-1 py-1 rounded text-[10px] transition-all ${
                  swarmStructure === s
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                    : 'bg-white/5 text-slate-500 border border-white/10 hover:border-cyan-500/30'
                }`}
              >
                {structureLabels[s]}
              </button>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            <label className="text-slate-500 text-[10px] block">{deploymentMode ? 'Target Fleet Size' : 'Density'}</label>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={nodeCount}
              onChange={(e) => dispatch({ type: 'SET_NODE_COUNT', payload: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <div className="mt-2 space-y-1">
            <label className="text-slate-500 text-[10px] block">Orbital Radius {baseRadius.toFixed(2)} AU</label>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={baseRadius}
              onChange={(e) => dispatch({ type: 'SET_BASE_RADIUS', payload: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          <div className="mt-2 space-y-1">
            <label className="text-slate-500 text-[10px] block">Time Scale {timeScale}x</label>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={timeScale}
              onChange={(e) => dispatch({ type: 'SET_TIME_SCALE', payload: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
            />
          </div>
        </div>

        {/* Unit Pilot Control - Only when selected */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="backdrop-blur-xl bg-black/50 border border-amber-500/30 rounded-lg shadow-2xl shadow-amber-500/5 p-4 font-mono text-sm"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
                <span className="text-amber-400 text-xs uppercase tracking-widest">Unit Control</span>
                <span className="text-amber-300/80 font-mono">#{selectedNode.id}</span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-300 mb-4">
                <div>a = {(selectedNode.elements.semiMajorAxis).toFixed(3)} AU</div>
                <div>e = {(selectedNode.elements.eccentricity).toFixed(4)}</div>
                <div>i = {(selectedNode.elements.inclination * 180 / Math.PI).toFixed(2)}°</div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1">Throttle {(pilot?.throttle ?? 100)}%</label>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    value={pilot?.throttle ?? 100}
                    onChange={(e) => setPilot({ throttle: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1">Attitude Pitch {(pilot?.attitudePitch ?? 0).toFixed(0)}°</label>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={pilot?.attitudePitch ?? 0}
                    onChange={(e) => setPilot({ attitudePitch: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1">Attitude Yaw {(pilot?.attitudeYaw ?? 0).toFixed(0)}°</label>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={pilot?.attitudeYaw ?? 0}
                    onChange={(e) => setPilot({ attitudeYaw: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] block mb-2">Orbital Burn</label>
                  <div className="flex gap-1">
                    {(['hold', 'raise', 'lower'] as BurnMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => handleBurn(m)}
                        className={`flex-1 py-1.5 rounded text-[10px] transition-all ${
                          (pilot?.burnMode ?? 'hold') === m
                            ? m === 'hold'
                              ? 'bg-slate-600 text-slate-200 border border-slate-500'
                              : m === 'raise'
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                              : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                            : 'bg-white/5 text-slate-500 border border-white/10 hover:border-amber-500/30'
                        }`}
                      >
                        {burnLabels[m]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_NODE_STATUS', payload: { nodeId: selectedNodeId!, status: (state.nodeStatus[selectedNodeId!] === 'maintenance' ? 'online' : 'maintenance') } })
                      logCommand(`Unit ${selectedNodeId}: ${state.nodeStatus[selectedNodeId!] === 'maintenance' ? 'Online' : 'Maintenance mode'}`, 'status')
                    }}
                    className={`flex-1 py-1.5 rounded text-[10px] transition-all ${
                      state.nodeStatus[selectedNodeId!] === 'maintenance'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    {state.nodeStatus[selectedNodeId!] === 'maintenance' ? 'Online' : 'Maintenance'}
                  </button>
                  <button
                    onClick={handleClearPilot}
                    className="flex-1 py-1.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/10 hover:border-slate-500 hover:text-slate-300 transition-all"
                  >
                    Clear Override
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SELECT_NODE', payload: null })}
                    className="flex-1 py-1.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right: Command Log - pt clears space for CameraModeToggle above */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="pointer-events-auto ml-auto w-72 flex flex-col p-4 pt-16"
      >
        <div className="backdrop-blur-xl bg-black/50 border border-slate-600/50 rounded-lg shadow-2xl flex-1 min-h-0 flex flex-col font-mono text-xs">
          <div className="flex items-center gap-2 p-2 border-b border-slate-600/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 uppercase tracking-widest">Command Log</span>
          </div>
          <div className="flex-1 overflow-y-auto hud-scroll p-2 space-y-1">
            {commandLog.length === 0 ? (
              <div className="text-slate-600 text-[10px] italic">Awaiting commands...</div>
            ) : (
              commandLog.slice(-15).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className={`text-[10px] py-0.5 ${
                    entry.type === 'warning' ? 'text-amber-400' :
                    entry.type === 'confirm' ? 'text-emerald-400' :
                    entry.type === 'status' ? 'text-slate-400' : 'text-slate-300'
                  }`}
                >
                  [{new Date(entry.timestamp).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8)}] {entry.message}
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
