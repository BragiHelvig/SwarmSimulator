/**
 * State management for Dyson Swarm
 * Admin control panel for humanity's orbital power infrastructure
 */

import { createContext, useContext, useReducer, useEffect } from 'react'
import type { SwarmStructure } from '@/engine/orbitalPhysics'
import type { SwarmNode } from '@/engine/types'

export type CameraMode = 'free' | 'node-eye'

export type BurnMode = 'hold' | 'raise' | 'lower'

export type NodeStatus = 'online' | 'degraded' | 'maintenance' | 'offline'

export interface NodePilotState {
  throttle: number
  attitudePitch: number
  attitudeYaw: number
  burnMode: BurnMode
  burnDelta: number
}

export interface CommandLogEntry {
  id: number
  timestamp: number
  nodeId: number | null
  message: string
  type: 'command' | 'status' | 'warning' | 'confirm'
}

export interface Alert {
  id: number
  type: 'proximity' | 'power' | 'maintenance' | 'system' | 'warning'
  message: string
  nodeIds?: number[]
  acknowledged: boolean
  timestamp: number
}

export interface SimulationSettings {
  showPlanetLabels: boolean
  showOrbitalTrails: boolean
  showCoordinateGrid: boolean
  showAsteroidBelt: boolean
  showLagrangePoints: boolean
  showProximityAlerts: boolean
}

export interface SimulationState {
  swarmStructure: SwarmStructure
  nodeCount: number
  baseRadius: number
  deploymentMode: boolean
  deployedCount: number
  timeScale: number
  selectedNodeId: number | null
  cameraMode: CameraMode
  energyHistory: { time: number; power: number }[]
  totalPower: number
  nodes: SwarmNode[]
  nodeOverrides: Record<number, NodePilotState>
  nodeStatus: Record<number, NodeStatus>
  commandLog: CommandLogEntry[]
  simTime: number
  paused: boolean
  energyStored: number
  alerts: Alert[]
  settings: SimulationSettings
  orbitalTrail: { x: number; y: number; z: number }[]
  solarFlareActive: boolean
}

type Action =
  | { type: 'SET_STRUCTURE'; payload: SwarmStructure }
  | { type: 'SET_NODE_COUNT'; payload: number }
  | { type: 'SET_BASE_RADIUS'; payload: number }
  | { type: 'SET_TIME_SCALE'; payload: number }
  | { type: 'SELECT_NODE'; payload: number | null }
  | { type: 'SET_CAMERA_MODE'; payload: CameraMode }
  | { type: 'UPDATE_POWER'; payload: { totalPower: number; time: number } }
  | { type: 'SET_NODES'; payload: SwarmNode[] }
  | { type: 'RESET_ENERGY_HISTORY' }
  | { type: 'SET_NODE_PILOT'; payload: { nodeId: number; pilot: Partial<NodePilotState> } }
  | { type: 'LOG_COMMAND'; payload: Omit<CommandLogEntry, 'id'> }
  | { type: 'CLEAR_PILOT'; payload: number }
  | { type: 'UPDATE_BURNS'; payload: { deltaTime: number } }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_NODE_STATUS'; payload: { nodeId: number; status: NodeStatus } }
  | { type: 'ADD_ALERT'; payload: Omit<Alert, 'id' | 'acknowledged'> }
  | { type: 'ACK_ALERT'; payload: number }
  | { type: 'SET_SETTINGS'; payload: Partial<SimulationSettings> }
  | { type: 'UPDATE_ORBITAL_TRAIL'; payload: { x: number; y: number; z: number } }
  | { type: 'SET_SOLAR_FLARE'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<SimulationState> }
  | { type: 'RESET_SIMULATION' }
  | { type: 'START_FROM_SCRATCH' }
  | { type: 'LAUNCH_SATELLITES'; payload: number }
  | { type: 'EXIT_DEPLOYMENT_MODE' }

let nextLogId = 0
let nextAlertId = 0
const defaultPilot: NodePilotState = { throttle: 100, attitudePitch: 0, attitudeYaw: 0, burnMode: 'hold', burnDelta: 0 }

const defaultSettings: SimulationSettings = {
  showPlanetLabels: true,
  showOrbitalTrails: true,
  showCoordinateGrid: false,
  showAsteroidBelt: true,
  showLagrangePoints: true,
  showProximityAlerts: true,
}

const initialState: SimulationState = {
  swarmStructure: 'swarm',
  nodeCount: 2000,
  baseRadius: 1.5,
  deploymentMode: false,
  deployedCount: 2000,
  timeScale: 0.5,
  selectedNodeId: null,
  cameraMode: 'free',
  energyHistory: [],
  totalPower: 0,
  nodes: [],
  nodeOverrides: {},
  nodeStatus: {},
  commandLog: [
    { id: -1, timestamp: Date.now(), nodeId: null, message: 'System online. Dyson Swarm Command initialized.', type: 'status' },
  ],
  simTime: 0,
  paused: false,
  energyStored: 0,
  alerts: [],
  settings: defaultSettings,
  orbitalTrail: [],
  solarFlareActive: false,
}

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'SET_STRUCTURE':
      return { ...state, swarmStructure: action.payload }
    case 'SET_NODE_COUNT': {
      const count = Math.max(100, Math.min(50000, action.payload))
      return {
        ...state,
        nodeCount: count,
        deployedCount: state.deploymentMode ? state.deployedCount : count,
      }
    }
    case 'SET_BASE_RADIUS':
      return { ...state, baseRadius: Math.max(0.5, Math.min(5, action.payload)) }
    case 'SET_TIME_SCALE':
      return { ...state, timeScale: Math.max(0, Math.min(100, action.payload)) }
    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
        orbitalTrail: [],
        commandLog: action.payload != null
          ? [...state.commandLog.slice(-49), { id: nextLogId++, timestamp: Date.now(), nodeId: action.payload, message: `Unit ${action.payload} selected. Pilot control active.`, type: 'status' }]
          : state.commandLog,
      }
    case 'SET_CAMERA_MODE':
      return { ...state, cameraMode: action.payload }
    case 'UPDATE_POWER': {
      const newHistory = [...state.energyHistory, { time: action.payload.time, power: action.payload.totalPower }]
      const trimmed = newHistory.slice(-300)
      const lastTime = state.energyHistory.length > 0 ? state.energyHistory[state.energyHistory.length - 1].time : action.payload.time - 0.1
      const dt = action.payload.time - lastTime
      const avgPower = (state.totalPower + action.payload.totalPower) / 2
      const energyGain = state.paused ? 0 : avgPower * dt * 0.001
      return {
        ...state,
        totalPower: action.payload.totalPower,
        energyHistory: trimmed,
        simTime: action.payload.time,
        energyStored: state.energyStored + energyGain,
      }
    }
    case 'SET_NODE_PILOT': {
      const current = state.nodeOverrides[action.payload.nodeId] || { ...defaultPilot }
      const pilot: NodePilotState = { ...defaultPilot, ...current, ...action.payload.pilot }
      return {
        ...state,
        nodeOverrides: { ...state.nodeOverrides, [action.payload.nodeId]: pilot },
      }
    }
    case 'LOG_COMMAND':
      return {
        ...state,
        commandLog: [...state.commandLog.slice(-49), { ...action.payload, id: nextLogId++ }],
      }
    case 'CLEAR_PILOT': {
      const { [action.payload]: _, ...rest } = state.nodeOverrides
      return { ...state, nodeOverrides: rest }
    }
    case 'UPDATE_BURNS': {
      const dt = action.payload.deltaTime
      const rate = 0.0001
      const next: Record<number, NodePilotState> = {}
      for (const [id, pilot] of Object.entries(state.nodeOverrides)) {
        const nid = Number(id)
        let burnDelta = pilot.burnDelta ?? 0
        if (pilot.burnMode === 'raise') burnDelta += rate * dt
        else if (pilot.burnMode === 'lower') burnDelta -= rate * dt
        burnDelta = Math.max(-0.5, Math.min(0.5, burnDelta))
        next[nid] = { ...pilot, burnDelta }
      }
      return { ...state, nodeOverrides: Object.keys(next).length ? next : state.nodeOverrides }
    }
    case 'SET_NODES':
      return { ...state, nodes: action.payload }
    case 'RESET_ENERGY_HISTORY':
      return { ...state, energyHistory: [] }
    case 'SET_PAUSED':
      return { ...state, paused: action.payload }
    case 'SET_NODE_STATUS':
      return {
        ...state,
        nodeStatus: { ...state.nodeStatus, [action.payload.nodeId]: action.payload.status },
      }
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts.filter(a => !a.acknowledged).slice(-9), { ...action.payload, id: nextAlertId++, acknowledged: false, timestamp: Date.now() }],
      }
    case 'ACK_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.payload ? { ...a, acknowledged: true } : a),
      }
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'UPDATE_ORBITAL_TRAIL':
      return {
        ...state,
        orbitalTrail: [...state.orbitalTrail.slice(-199), action.payload].slice(-200),
      }
    case 'SET_SOLAR_FLARE':
      return { ...state, solarFlareActive: action.payload }
    case 'LOAD_STATE':
      return { ...state, ...action.payload }
    case 'RESET_SIMULATION':
      return { ...initialState, commandLog: [{ id: nextLogId++, timestamp: Date.now(), nodeId: null, message: 'Simulation reset.', type: 'status' }] }
    case 'START_FROM_SCRATCH':
      return {
        ...state,
        deploymentMode: true,
        deployedCount: 0,
        paused: true,
        energyHistory: [],
        totalPower: 0,
        energyStored: 0,
        simTime: 0,
        orbitalTrail: [],
        selectedNodeId: null,
        nodeOverrides: {},
        nodeStatus: {},
        commandLog: [...state.commandLog.slice(-49), { id: nextLogId++, timestamp: Date.now(), nodeId: null, message: 'Deployment mode: Starting from scratch. Launch satellites individually.', type: 'status' }],
      }
    case 'LAUNCH_SATELLITES':
      const toLaunch = Math.min(action.payload, Math.max(0, state.nodeCount - state.deployedCount))
      const newDeployed = state.deployedCount + toLaunch
      return {
        ...state,
        deployedCount: Math.min(newDeployed, state.nodeCount),
        commandLog: toLaunch > 0
          ? [...state.commandLog.slice(-49), { id: nextLogId++, timestamp: Date.now(), nodeId: null, message: `Launched ${toLaunch} satellite${toLaunch > 1 ? 's' : ''}. Fleet: ${newDeployed}/${state.nodeCount}`, type: 'confirm' }]
          : state.commandLog,
      }
    case 'EXIT_DEPLOYMENT_MODE':
      return {
        ...state,
        deploymentMode: false,
        deployedCount: state.nodeCount,
        commandLog: [...state.commandLog.slice(-49), { id: nextLogId++, timestamp: Date.now(), nodeId: null, message: 'Deployment complete. Full fleet operational.', type: 'status' }],
      }
    default:
      return state
  }
}

const SimulationContext = createContext<{
  state: SimulationState
  dispatch: React.Dispatch<Action>
} | null>(null)

const STORAGE_KEY = 'dyson-swarm-state'

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.settings) dispatch({ type: 'LOAD_STATE', payload: { settings: parsed.settings } })
      } catch (_) {}
    }
  }, [])

  useEffect(() => {
    const toSave = { settings: state.settings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }, [state.settings])

  return (
    <SimulationContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
