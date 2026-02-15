import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import { useSimulation } from '@/store/useSimulationStore'
import { elementsToPosition, orbitalPeriod } from '@/engine/orbitalPhysics'
import { PLANETS } from '@/engine/planetaryData'
import * as THREE from 'three'

const SCALE = 2

export function SolarSystem() {
  const { state } = useSimulation()
  const { timeScale, paused, settings } = state
  const effectiveTimeScale = paused ? 0 : timeScale

  return (
    <group>
      {PLANETS.map((planet) => (
        <group key={planet.name}>
          <OrbitPath elements={planet.elements} color={planet.color} />
          <Planet planet={planet} timeScale={effectiveTimeScale} showLabel={settings.showPlanetLabels} />
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

function Planet({ planet, timeScale, showLabel }: { planet: typeof PLANETS[0]; timeScale: number; showLabel: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!meshRef.current || !groupRef.current) return

    const time = performance.now() * 0.001
    const period = orbitalPeriod(planet.elements.semiMajorAxis)
    const meanAnomaly = (planet.elements.meanAnomaly + (time * timeScale) / period * 2 * Math.PI) % (2 * Math.PI)
    const orbState = elementsToPosition(planet.elements, meanAnomaly, SCALE)

    groupRef.current.position.copy(orbState.position)
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <meshStandardMaterial
          color={planet.color}
          metalness={0.1}
          roughness={0.8}
          emissive={planet.emissive ?? 0x000000}
        />
      </mesh>
      {showLabel && (
        <Html center distanceFactor={15} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div className="text-white/90 font-mono text-xs whitespace-nowrap -translate-x-1/2">
            {planet.name}
          </div>
        </Html>
      )}
    </group>
  )
}
