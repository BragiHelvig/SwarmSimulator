import { getLagrangePoints } from '@/engine/lagrangePoints'

export function LagrangePoints() {
  const points = getLagrangePoints()

  return (
    <group>
      {points.map(({ name, position, color }) => (
        <group key={name} position={[position.x, position.y, position.z]}>
          <mesh>
            <octahedronGeometry args={[0.008, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
