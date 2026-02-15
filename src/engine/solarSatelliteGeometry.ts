/**
 * Creates a detailed solar satellite geometry for InstancedMesh
 * Hub + solar panel arrays + antenna - reads as a real power collector
 */

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export function createSolarSatelliteGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []

  // Central hub - the main body
  const hub = new THREE.BoxGeometry(0.012, 0.012, 0.012)
  hub.translate(0, 0, 0)
  parts.push(hub)

  // Solar panel arrays - two wings extending from the hub
  // Each wing: thin rectangular panel (the collector surface)
  const panelDepth = 0.002
  const panelWidth = 0.025
  const panelHeight = 0.018
  const wingOffset = 0.008 // distance from hub center

  // Left wing
  const leftWing = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth)
  leftWing.translate(-wingOffset - panelWidth / 2, 0, 0)
  parts.push(leftWing)

  // Right wing
  const rightWing = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth)
  rightWing.translate(wingOffset + panelWidth / 2, 0, 0)
  parts.push(rightWing)

  // Top wing (perpendicular - cross configuration)
  const topWing = new THREE.BoxGeometry(panelDepth, panelHeight, panelWidth)
  topWing.translate(0, wingOffset + panelHeight / 2, 0)
  parts.push(topWing)

  // Bottom wing
  const bottomWing = new THREE.BoxGeometry(panelDepth, panelHeight, panelWidth)
  bottomWing.translate(0, -wingOffset - panelHeight / 2, 0)
  parts.push(bottomWing)

  // Small antenna/comm array on top (box for attribute compatibility)
  const antenna = new THREE.BoxGeometry(0.003, 0.008, 0.003)
  antenna.translate(0, 0.012, 0)
  parts.push(antenna)

  const merged = mergeGeometries(parts)
  if (!merged) {
    return new THREE.BoxGeometry(0.02, 0.02, 0.02)
  }
  return merged
}
