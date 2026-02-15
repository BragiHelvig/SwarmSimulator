/**
 * Shared types for Dyson Swarm simulation
 */

import type { OrbitalElements } from './orbitalPhysics'

export interface SwarmNode {
  id: number
  elements: OrbitalElements
  meanAnomaly: number
  powerOutput: number
  selected?: boolean
}

export interface SimulationState {
  swarmStructure: 'ring' | 'shell' | 'swarm'
  nodeCount: number
  baseRadius: number
  timeScale: number
  selectedNodeId: number | null
  cameraMode: 'free' | 'node-eye'
  energyHistory: { time: number; power: number }[]
  totalPower: number
}
