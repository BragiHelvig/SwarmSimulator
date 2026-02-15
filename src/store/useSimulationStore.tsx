/**
 * State management for Dyson Swarm
 * Admin control panel for humanity's orbital power infrastructure
 */

import { createContext, useContext, useReducer } from 'react'
import type { SwarmStructure } from '@/engine/orbitalPhysics'
import type { SwarmNode } from '@/engine/types'

export type CameraMode = 'free' | 'node-eye'

export type BurnMode = 'hold' | 'raise' | 'lower'

export interface NodePilotState {
  throttle: number        // 0-150%, orbital velocity modifier
  attitudePitch: number   // degrees, panel tilt from sun-normal
  attitudeYaw: number     // degrees
  burnMode: BurnMode
  burnDelta: number       // accumulated semi-major axis change from burns (AU)
}

export interface CommandLogEntry {
  id: number
  timestamp: number
  nodeId: number | null
  message: string
  type: 'command' | 'status' | 'warning' | 'confirm'
}

export interface SimulationState {
  swarmStructure: SwarmStructure
  nodeCount: number
  baseRadius: number
  timeScale: number
  selectedNodeId: number | null
  cameraMode: CameraMode
  energyHistory: { time: number; power: number }[]
  totalPower: number
  nodes: SwarmNode[]
  nodeOverrides: Record<number, NodePilotState>
  commandLog: CommandLogEntry[]
  simTime: number
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

let nextLogId = 0
const defaultPilot: NodePilotState = { throttle: 100, attitudePitch: 0, attitudeYaw: 0, burnMode: 'hold', burnDelta: 0 }

const initialState: SimulationState = {
  swarmStructure: 'swarm',
  nodeCount: 2000,
  baseRadius: 1.5,
  timeScale: 0.5,
  selectedNodeId: null,
  cameraMode: 'free',
  energyHistory: [],
  totalPower: 0,
  nodes: [],
  nodeOverrides: {},
  commandLog: [
    { id: -1, timestamp: Date.now(), nodeId: null, message: 'System online. Dyson Swarm Command initialized.', type: 'status' },
  ],
  simTime: 0,
}

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'SET_STRUCTURE':
      return { ...state, swarmStructure: action.payload }
    case 'SET_NODE_COUNT':
      return { ...state, nodeCount: Math.max(100, Math.min(50000, action.payload)) }
    case 'SET_BASE_RADIUS':
      return { ...state, baseRadius: Math.max(0.5, Math.min(5, action.payload)) }
    case 'SET_TIME_SCALE':
      return { ...state, timeScale: Math.max(0, Math.min(100, action.payload)) }
    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
        commandLog: action.payload != null
          ? [...state.commandLog.slice(-49), { id: nextLogId++, timestamp: Date.now(), nodeId: action.payload, message: `Unit ${action.payload} selected. Pilot control active.`, type: 'status' }]
          : state.commandLog,
      }
    case 'SET_CAMERA_MODE':
      return { ...state, cameraMode: action.payload }
    case 'UPDATE_POWER': {
      const newHistory = [...state.energyHistory, { time: action.payload.time, power: action.payload.totalPower }]
      const trimmed = newHistory.slice(-300)
      return { ...state, totalPower: action.payload.totalPower, energyHistory: trimmed, simTime: action.payload.time }
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
    default:
      return state
  }
}

const SimulationContext = createContext<{
  state: SimulationState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
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
