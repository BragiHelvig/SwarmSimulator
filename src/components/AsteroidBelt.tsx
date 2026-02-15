import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSimulation } from '@/store/useSimulationStore'
import { elementsToPosition, orbitalPeriod } from '@/engine/orbitalPhysics'
import { generateAsteroidBelt } from '@/engine/asteroidBelt'
import * as THREE from 'three'

const SCALE = 2

export function AsteroidBelt() {
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const { state } = useSimulation()
  const { timeScale, paused } = state

  const elements = useMemo(() => generateAsteroidBelt(150), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!instancedRef.current || paused) return
    const time = performance.now() * 0.001

    elements.forEach((el, i) => {
      const period = orbitalPeriod(el.semiMajorAxis)
      const meanAnomaly = (el.meanAnomaly + (time * timeScale) / period * 2 * Math.PI) % (2 * Math.PI)
      const orbState = elementsToPosition(el, meanAnomaly, SCALE)
      dummy.position.copy(orbState.position)
      dummy.updateMatrix()
      instancedRef.current!.setMatrixAt(i, dummy.matrix)
    })
    instancedRef.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, elements.length]} count={elements.length}>
      <sphereGeometry args={[0.002, 8, 8]} />
      <meshStandardMaterial color={0x8b7355} metalness={0.2} roughness={0.8} />
    </instancedMesh>
  )
}
