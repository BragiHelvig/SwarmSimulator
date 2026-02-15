/**
 * Asteroid belt orbital elements (simplified)
 * Main belt between Mars and Jupiter
 */

import type { OrbitalElements } from './orbitalPhysics'

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function generateAsteroidBelt(count: number, seed = 123): OrbitalElements[] {
  const elements: OrbitalElements[] = []
  const random = seededRandom(seed)
  for (let i = 0; i < count; i++) {
    const r = 2.2 + random() * 1.5
    elements.push({
      semiMajorAxis: r,
      eccentricity: 0.05 + random() * 0.15,
      inclination: random() * 0.15,
      longitudeAscending: random() * 2 * Math.PI,
      argumentPeriapsis: random() * 2 * Math.PI,
      meanAnomaly: random() * 2 * Math.PI,
    })
  }
  return elements
}
