/**
 * Solar system planetary data for visualization
 * Orbital elements and physical properties (scaled for visibility)
 */

import type { OrbitalElements } from './orbitalPhysics'

export interface PlanetData {
  name: string
  elements: OrbitalElements
  radius: number      // scaled for visibility (real scale would be tiny)
  color: number
  emissive?: number
}

// Orbital periods in our sim units (1 year = 2π)
// Semi-major axis in AU, eccentricity, inclination (rad), etc.
// Mean anomaly at t=0 for initial positions
export const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    elements: {
      semiMajorAxis: 0.387,
      eccentricity: 0.206,
      inclination: 0.035,
      longitudeAscending: 0.844,
      argumentPeriapsis: 1.351,
      meanAnomaly: 4.15,
    },
    radius: 0.006,
    color: 0x8c7853,
  },
  {
    name: 'Venus',
    elements: {
      semiMajorAxis: 0.723,
      eccentricity: 0.007,
      inclination: 0.032,
      longitudeAscending: 1.338,
      argumentPeriapsis: 1.381,
      meanAnomaly: 1.625,
    },
    radius: 0.01,
    color: 0xe6c229,
  },
  {
    name: 'Earth',
    elements: {
      semiMajorAxis: 1.0,
      eccentricity: 0.017,
      inclination: 0,
      longitudeAscending: 0,
      argumentPeriapsis: 1.796,
      meanAnomaly: 6.17,
    },
    radius: 0.01,
    color: 0x2233ff,
  },
  {
    name: 'Mars',
    elements: {
      semiMajorAxis: 1.524,
      eccentricity: 0.093,
      inclination: 0.032,
      longitudeAscending: 0.864,
      argumentPeriapsis: 0.955,
      meanAnomaly: 5.65,
    },
    radius: 0.006,
    color: 0xc1440e,
  },
  {
    name: 'Jupiter',
    elements: {
      semiMajorAxis: 5.203,
      eccentricity: 0.048,
      inclination: 0.023,
      longitudeAscending: 1.754,
      argumentPeriapsis: 4.563,
      meanAnomaly: 0.257,
    },
    radius: 0.025,
    color: 0xc88b3a,
  },
  {
    name: 'Saturn',
    elements: {
      semiMajorAxis: 9.537,
      eccentricity: 0.054,
      inclination: 0.043,
      longitudeAscending: 1.983,
      argumentPeriapsis: 5.321,
      meanAnomaly: 5.96,
    },
    radius: 0.02,
    color: 0xf4d59e,
  },
  {
    name: 'Uranus',
    elements: {
      semiMajorAxis: 19.191,
      eccentricity: 0.046,
      inclination: 0.013,
      longitudeAscending: 1.291,
      argumentPeriapsis: 2.499,
      meanAnomaly: 2.98,
    },
    radius: 0.012,
    color: 0x4fd0e6,
  },
  {
    name: 'Neptune',
    elements: {
      semiMajorAxis: 30.069,
      eccentricity: 0.009,
      inclination: 0.03,
      longitudeAscending: 2.299,
      argumentPeriapsis: 4.634,
      meanAnomaly: 0.784,
    },
    radius: 0.011,
    color: 0x4166f5,
  },
]
