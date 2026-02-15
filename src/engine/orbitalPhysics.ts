/**
 * Keplerian Orbital Mechanics Engine
 * Implements two-body orbital dynamics for Dyson Swarm simulation
 */

import * as THREE from 'three'

export type SwarmStructure = 'ring' | 'shell' | 'swarm'

export interface OrbitalElements {
  semiMajorAxis: number    // a (AU or scaled units)
  eccentricity: number     // e (0 = circular)
  inclination: number      // i (radians)
  longitudeAscending: number  // Ω (radians)
  argumentPeriapsis: number   // ω (radians)
  meanAnomaly: number      // M at t=0 (radians)
}

export interface OrbitalState {
  position: THREE.Vector3
  velocity: THREE.Vector3
  trueAnomaly: number
  distance: number
}

// Gravitational parameter (simplified - Sun mass in AU³/year²)
const MU = 4 * Math.PI * Math.PI

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly using Newton-Raphson
 */
function solveKepler(meanAnomaly: number, eccentricity: number, tolerance = 1e-10): number {
  let E = meanAnomaly
  if (eccentricity > 0.8) E = Math.PI
  
  for (let i = 0; i < 50; i++) {
    const delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E))
    E -= delta
    if (Math.abs(delta) < tolerance) break
  }
  return E
}

/**
 * Convert mean anomaly to true anomaly
 */
function meanToTrueAnomaly(meanAnomaly: number, eccentricity: number): number {
  const E = solveKepler(meanAnomaly, eccentricity)
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
  )
  return nu
}

/**
 * Get orbital period in arbitrary time units (T = 2π√(a³/μ))
 */
export function orbitalPeriod(semiMajorAxis: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / MU)
}

/**
 * Compute 3D position from Keplerian elements at a given mean anomaly
 */
export function elementsToPosition(
  elements: OrbitalElements,
  meanAnomaly: number,
  scale = 1
): OrbitalState {
  const { semiMajorAxis, eccentricity, inclination, longitudeAscending, argumentPeriapsis } = elements
  
  const trueAnomaly = meanToTrueAnomaly(meanAnomaly, eccentricity)
  const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly))
  
  // Position in orbital plane (perifocal frame)
  const x = r * Math.cos(trueAnomaly)
  const y = r * Math.sin(trueAnomaly)
  
  // Rotation matrices: Rz(-Ω) * Rx(-i) * Rz(-ω)
  const cosOmega = Math.cos(longitudeAscending)
  const sinOmega = Math.sin(longitudeAscending)
  const cosI = Math.cos(inclination)
  const sinI = Math.sin(inclination)
  const cosOmegaSmall = Math.cos(argumentPeriapsis)
  const sinOmegaSmall = Math.sin(argumentPeriapsis)
  
  const px = (cosOmega * cosOmegaSmall - sinOmega * sinOmegaSmall * cosI) * x +
            (-cosOmega * sinOmegaSmall - sinOmega * cosOmegaSmall * cosI) * y
  const py = (sinOmega * cosOmegaSmall + cosOmega * sinOmegaSmall * cosI) * x +
            (-sinOmega * sinOmegaSmall + cosOmega * cosOmegaSmall * cosI) * y
  const pz = sinOmegaSmall * sinI * x + cosOmegaSmall * sinI * y
  
  const position = new THREE.Vector3(px * scale, py * scale, pz * scale)
  
  // Velocity (simplified - for orientation we mainly need position)
  const h = Math.sqrt(MU * semiMajorAxis * (1 - eccentricity * eccentricity))
  const vx = -MU / h * Math.sin(trueAnomaly)
  const vy = MU / h * (eccentricity + Math.cos(trueAnomaly))
  
  const vpx = (cosOmega * cosOmegaSmall - sinOmega * sinOmegaSmall * cosI) * vx +
             (-cosOmega * sinOmegaSmall - sinOmega * cosOmegaSmall * cosI) * vy
  const vpy = (sinOmega * cosOmegaSmall + cosOmega * sinOmegaSmall * cosI) * vx +
             (-sinOmega * sinOmegaSmall + cosOmega * cosOmegaSmall * cosI) * vy
  const vpz = sinOmegaSmall * sinI * vx + cosOmegaSmall * sinI * vy
  
  const velocity = new THREE.Vector3(vpx * scale, vpy * scale, vpz * scale)
  
  return { position, velocity, trueAnomaly, distance: r * scale }
}

/**
 * Generate orbital elements for different swarm structures
 */
export function generateSwarmElements(
  structure: SwarmStructure,
  count: number,
  baseRadius: number,
  seed = 42
): OrbitalElements[] {
  const elements: OrbitalElements[] = []
  const random = seededRandom(seed)
  
  switch (structure) {
    case 'ring': {
      // Single equatorial ring - all same orbit, distributed by mean anomaly
      for (let i = 0; i < count; i++) {
        elements.push({
          semiMajorAxis: baseRadius,
          eccentricity: 0.02 + random() * 0.02,
          inclination: 0,
          longitudeAscending: 0,
          argumentPeriapsis: 0,
          meanAnomaly: (i / count) * 2 * Math.PI,
        })
      }
      break
    }
    
    case 'shell': {
      // Spherical shell - uniform distribution on sphere, circular orbits
      for (let i = 0; i < count; i++) {
        const theta = Math.acos(2 * random() - 1)
        const phi = random() * 2 * Math.PI
        const r = baseRadius * (0.95 + random() * 0.1)
        
        elements.push({
          semiMajorAxis: r,
          eccentricity: 0.01,
          inclination: theta,
          longitudeAscending: phi,
          argumentPeriapsis: random() * 2 * Math.PI,
          meanAnomaly: random() * 2 * Math.PI,
        })
      }
      break
    }
    
    case 'swarm': {
      // Mixed swarm - varied orbital planes and parameters
      for (let i = 0; i < count; i++) {
        const r = baseRadius * (0.7 + random() * 0.6)
        elements.push({
          semiMajorAxis: r,
          eccentricity: 0.05 + random() * 0.15,
          inclination: random() * Math.PI * 0.4,
          longitudeAscending: random() * 2 * Math.PI,
          argumentPeriapsis: random() * 2 * Math.PI,
          meanAnomaly: random() * 2 * Math.PI,
        })
      }
      break
    }
  }
  
  return elements
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/**
 * Calculate power output (MW) based on distance - inverse square law
 * P ∝ 1/r², normalized so 1 AU = 1 GW baseline per collector
 */
export function powerAtDistance(distance: number, baselineDistance = 1): number {
  const irradiance = Math.pow(baselineDistance / distance, 2)
  return irradiance * 1000 // MW per collector at 1 AU
}
