import { useRef } from 'react'
import * as THREE from 'three'

const GRID_SIZE = 8
const SCALE = 2

export function CoordinateGrid() {
  const gridRef = useRef<THREE.GridHelper>(null)

  return (
    <gridHelper
      ref={gridRef}
      args={[GRID_SIZE * SCALE, 20, 0x334455, 0x223344]}
      position={[0, 0, 0]}
    />
  )
}
