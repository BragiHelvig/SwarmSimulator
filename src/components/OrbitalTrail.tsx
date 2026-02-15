import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { useSimulation } from '@/store/useSimulationStore'
import * as THREE from 'three'

export function OrbitalTrail() {
  const { state } = useSimulation()
  const { orbitalTrail } = state

  const points = useMemo(() => {
    return orbitalTrail.map(p => new THREE.Vector3(p.x, p.y, p.z))
  }, [orbitalTrail])

  if (points.length < 2) return null

  return (
    <Line
      points={points}
      color={0x00f5ff}
      lineWidth={1}
      transparent
      opacity={0.6}
    />
  )
}
