/**
 * Earth-Sun Lagrange points (L1-L5)
 * Simplified: L1-L5 positions in the ecliptic plane
 */

import * as THREE from 'three'

const SCALE = 2
const EARTH_ORBIT = 1.0 * SCALE

// L1: Sun-Earth line, between Sun and Earth (~0.99 AU from Sun)
// L2: Sun-Earth line, beyond Earth (~1.01 AU)
// L3: Opposite side of Sun (~1 AU)
// L4, L5: 60° ahead/behind Earth in orbit (Trojan points)
export function getLagrangePoints(): { name: string; position: THREE.Vector3; color: number }[] {
  return [
    { name: 'L1', position: new THREE.Vector3(EARTH_ORBIT * 0.99, 0, 0), color: 0xff6b6b },
    { name: 'L2', position: new THREE.Vector3(EARTH_ORBIT * 1.01, 0, 0), color: 0x4ecdc4 },
    { name: 'L3', position: new THREE.Vector3(-EARTH_ORBIT, 0, 0), color: 0xffe66d },
    { name: 'L4', position: new THREE.Vector3(EARTH_ORBIT * 0.5, EARTH_ORBIT * 0.866, 0), color: 0x95e1d3 },
    { name: 'L5', position: new THREE.Vector3(EARTH_ORBIT * 0.5, -EARTH_ORBIT * 0.866, 0), color: 0x95e1d3 },
  ]
}
