import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSimulation } from '@/store/useSimulationStore'
import {
  elementsToPosition,
  powerAtDistance,
  generateSwarmElements,
  orbitalPeriod,
} from '@/engine/orbitalPhysics'
import type { SwarmNode } from '@/engine/types'
import * as THREE from 'three'
import { createSolarSatelliteGeometry } from '@/engine/solarSatelliteGeometry'

const SCALE = 2
const BASELINE_DISTANCE = 1.5

const satelliteGeometry = createSolarSatelliteGeometry()

export function SwarmNodes() {
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const { state, dispatch } = useSimulation()
  const { swarmStructure, nodeCount, baseRadius, timeScale, selectedNodeId, nodeOverrides, paused, settings, nodeStatus, deploymentMode, deployedCount } = state

  const effectiveCount = deploymentMode ? deployedCount : nodeCount

  const elements = useMemo(() => {
    return generateSwarmElements(swarmStructure, Math.max(nodeCount, 1), baseRadius).slice(0, effectiveCount)
  }, [swarmStructure, nodeCount, baseRadius, effectiveCount])

  const nodes: SwarmNode[] = useMemo(() => {
    return elements.map((el, i) => ({
      id: i,
      elements: el,
      meanAnomaly: el.meanAnomaly,
      powerOutput: 0,
    }))
  }, [elements])

  useEffect(() => {
    dispatch({ type: 'SET_NODES', payload: nodes })
  }, [nodes, dispatch])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const zero = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  // Per-instance phase for staggered animation (reduces "dizzy" uniform motion)
  const phases = useMemo(() => {
    const arr = new Float32Array(elements.length)
    for (let i = 0; i < elements.length; i++) {
      arr[i] = (i / Math.max(1, elements.length)) * Math.PI * 2
    }
    return arr
  }, [elements.length])

  const lastPowerUpdate = useRef(0)
  const lastBurnUpdate = useRef(0)

  useFrame((_, delta) => {
    lastBurnUpdate.current += delta
    if (!instancedRef.current) return

    const time = performance.now() * 0.001
    const effectiveTimeScale = paused ? 0 : timeScale

    elements.forEach((el, i) => {
      const override = nodeOverrides[i]
      const throttle = override ? override.throttle / 100 : 1
      const burnDelta = override?.burnDelta ?? 0
      const a = Math.max(0.3, el.semiMajorAxis + burnDelta)
      const period = orbitalPeriod(a)
      const meanAnomaly = (el.meanAnomaly + (time * effectiveTimeScale * throttle) / period * 2 * Math.PI) % (2 * Math.PI)
      const orbState = elementsToPosition({ ...el, semiMajorAxis: a }, meanAnomaly, SCALE)

      dummy.position.copy(orbState.position)

      if (selectedNodeId === i && settings.showOrbitalTrails) {
        dispatch({ type: 'UPDATE_ORBITAL_TRAIL', payload: { x: orbState.position.x, y: orbState.position.y, z: orbState.position.z } })
      }
      dummy.lookAt(zero)

      // Pilot attitude override - panel tilt
      if (override && (override.attitudePitch !== 0 || override.attitudeYaw !== 0)) {
        dummy.rotateX((override.attitudePitch * Math.PI) / 180)
        dummy.rotateZ((override.attitudeYaw * Math.PI) / 180)
      }

      // Idle micro-adjustment: collectors track sun with slight lag - staggered by phase
      const phase = phases[i] ?? 0
      const wobble = Math.sin(time * 0.8 + phase) * 0.03
      dummy.rotateZ(wobble)
      dummy.updateMatrix()

      instancedRef.current!.setMatrixAt(i, dummy.matrix)

      // Emissive pulse - selected nodes brighter, burn mode adds amber/emerald tint, maintenance = dimmed
      const status = nodeStatus[i]
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.2 + phase)
      let baseColor = selectedNodeId === i ? 0x00f5ff : 0x4488ff
      if (status === 'maintenance') baseColor = 0x666666
      else if (override?.burnMode === 'raise') baseColor = 0x22dd88
      else if (override?.burnMode === 'lower') baseColor = 0xff6644
      const intensity = status === 'maintenance' ? 0.1 : selectedNodeId === i ? 0.6 + pulse * 0.4 : 0.25 + pulse * 0.15
      const c = new THREE.Color(baseColor)
      c.offsetHSL(0, 0, (intensity - 0.5) * 0.3)
      instancedRef.current!.setColorAt(i, c)
    })

    instancedRef.current.instanceMatrix.needsUpdate = true
    if (instancedRef.current.instanceColor) instancedRef.current.instanceColor.needsUpdate = true

    let totalPower = 0
    elements.forEach((el, i) => {
      if (nodeStatus[i] === 'maintenance') return
      const period = orbitalPeriod(el.semiMajorAxis)
      const override = nodeOverrides[i]
      const throttle = override ? override.throttle / 100 : 1
      const meanAnomaly = (el.meanAnomaly + (time * effectiveTimeScale * throttle) / period * 2 * Math.PI) % (2 * Math.PI)
      const orbState = elementsToPosition(el, meanAnomaly, SCALE)
      totalPower += powerAtDistance(orbState.distance, BASELINE_DISTANCE)
    })

    if (time - lastPowerUpdate.current > 0.1) {
      lastPowerUpdate.current = time
      dispatch({ type: 'UPDATE_POWER', payload: { totalPower, time } })
    }
    if (Object.keys(nodeOverrides).length > 0 && lastBurnUpdate.current > 0.05) {
      dispatch({ type: 'UPDATE_BURNS', payload: { deltaTime: lastBurnUpdate.current } })
      lastBurnUpdate.current = 0
    }
  })

  return (
    <instancedMesh
      key={elements.length}
      ref={instancedRef}
      args={[undefined, undefined, elements.length]}
      count={elements.length}
      castShadow
      receiveShadow
      onPointerDown={(e) => {
        e.stopPropagation()
        if (e.instanceId !== undefined) {
          dispatch({ type: 'SELECT_NODE', payload: e.instanceId })
        }
      }}
    >
      <primitive object={satelliteGeometry} attach="geometry" />
      <meshStandardMaterial
        color="#4488ff"
        emissive="#0066cc"
        emissiveIntensity={0.5}
        metalness={0.92}
        roughness={0.08}
        envMapIntensity={1.2}
        vertexColors
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}
