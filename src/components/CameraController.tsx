import { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useSimulation } from '@/store/useSimulationStore'
import { elementsToPosition, orbitalPeriod } from '@/engine/orbitalPhysics'

const SCALE = 2

export function CameraController() {
  const { camera } = useThree()
  const { state } = useSimulation()
  const { cameraMode, selectedNodeId, nodes, timeScale, nodeOverrides } = state
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta

    if (cameraMode === 'node-eye' && selectedNodeId != null && nodes.length > 0 && selectedNodeId < nodes.length) {
      const node = nodes[selectedNodeId]
      if (node) {
        const pilot = nodeOverrides[selectedNodeId]
        const throttle = pilot ? pilot.throttle / 100 : 1
        const period = orbitalPeriod(node.elements.semiMajorAxis)
        const meanAnomaly = (node.elements.meanAnomaly + (timeRef.current * timeScale * throttle) / period * 2 * Math.PI) % (2 * Math.PI)
        const orbState = elementsToPosition({ ...node.elements, meanAnomaly }, meanAnomaly, SCALE)

        camera.position.lerp(orbState.position, 0.08)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
      }
    }
  })

  return (
    <OrbitControls
      enableZoom
      enablePan
      enableRotate
      minDistance={1}
      maxDistance={20}
      makeDefault
      enabled={cameraMode === 'free'}
    />
  )
}
