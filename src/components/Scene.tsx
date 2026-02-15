import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, ToneMapping, SMAA, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { CameraController } from './CameraController'
import { SimulationScene } from './SimulationScene'

export function Scene() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: true,
      }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2.5]}
    >
      <color attach="background" args={['#050508']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#fff5e6" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f5ff" />

      <Suspense fallback={null}>
        <SimulationScene />
      </Suspense>

      <CameraController />

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={2}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.92}
          mipmapBlur
          radius={0.85}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0004, 0.0004)}
          radialModulation
          modulationOffset={0.5}
        />
        <ToneMapping
          blendFunction={BlendFunction.NORMAL}
          adaptive
          resolution={512}
          middleGrey={0.48}
          maxLuminance={20}
          averageLuminance={1.2}
          adaptationRate={1.2}
        />
        <Vignette
          blendFunction={BlendFunction.NORMAL}
          offset={0.35}
          darkness={0.6}
          eskil={false}
        />
        <SMAA preset={2} />
      </EffectComposer>
    </Canvas>
  )
}
