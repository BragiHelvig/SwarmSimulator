import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useSimulation } from '@/store/useSimulationStore'
import { elementsToPosition, orbitalPeriod } from '@/engine/orbitalPhysics'
import { PLANETS } from '@/engine/planetaryData'
import * as THREE from 'three'

const SCALE = 2

export function SolarSystem() {
  const { state } = useSimulation()
  const { timeScale } = state

  return (
    <group>
      {PLANETS.map((planet) => (
        <group key={planet.name}>
          <OrbitPath elements={planet.elements} color={planet.color} />
          <Planet planet={planet} timeScale={timeScale} />
        </group>
      ))}
    </group>
  )
}

function OrbitPath({ elements, color }: { elements: typeof PLANETS[0]['elements']; color: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const M = (i / 128) * Math.PI * 2
      const state = elementsToPosition(elements, M, SCALE)
      pts.push(state.position.clone())
    }
    return pts
  }, [elements])

  return <Line points={points} color={color} lineWidth={0.5} transparent opacity={0.25} />
}

function Planet({ planet, timeScale }: { planet: typeof PLANETS[0]; timeScale: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return

    const time = performance.now() * 0.001
    const period = orbitalPeriod(planet.elements.semiMajorAxis)
    const meanAnomaly = (planet.elements.meanAnomaly + (time * timeScale) / period * 2 * Math.PI) % (2 * Math.PI)
    const orbState = elementsToPosition(planet.elements, meanAnomaly, SCALE)

    meshRef.current.position.copy(orbState.position)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[planet.radius, 64, 64]} />
      <meshStandardMaterial
        color={planet.color}
        metalness={0.1}
        roughness={0.8}
        emissive={planet.emissive ?? 0x000000}
      />
    </mesh>
  )
}
