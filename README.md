# Dyson Swarm Simulation

A high-fidelity, interactive Dyson Swarm simulation built with React, Three.js (react-three-fiber), Tailwind CSS, and Framer Motion.

## Features

- **Keplerian Orbital Mechanics** — Thousands of solar collectors orbit a central star using realistic two-body dynamics
- **Swarm Structures** — Toggle between Dyson Ring, Shell, and Swarm configurations
- **Custom Star Shaders** — GLSL shaders for solar flares, surface granulation, and corona
- **Future-Tech HUD** — Glassmorphism UI with cyan/amber neon accents and JetBrains Mono typography
- **Node Command Mode** — Click any collector to select it and view orbital parameters (semi-major axis, eccentricity, inclination)
- **Node-Eye View** — Camera snaps to a selected collector and looks back at the sun
- **Real-time Power Output** — Live readout and energy accumulation graph
- **Post-Processing** — Bloom, chromatic aberration, and tone mapping for a cinematic look

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — Build tooling
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/drei** — OrbitControls, utilities
- **@react-three/postprocessing** — Bloom, ChromaticAberration, ToneMapping
- **Tailwind CSS** — Styling
- **Framer Motion** — UI animations
- **Recharts** — Energy graph

## Project Structure

```
src/
├── engine/           # Physics & orbital mechanics
│   ├── orbitalPhysics.ts
│   └── types.ts
├── store/            # State management
│   └── useSimulationStore.tsx
├── components/       # 3D scene & UI
│   ├── Star.tsx
│   ├── SwarmNodes.tsx
│   ├── Scene.tsx
│   ├── CameraController.tsx
│   └── ui/
│       ├── ControlHUD.tsx
│       ├── EnergyGraph.tsx
│       └── CameraModeToggle.tsx
└── shaders/          # GLSL (inlined in Star.tsx)
```

## Controls

- **Orbit** — Drag to rotate camera
- **Zoom** — Scroll wheel
- **Click collector** — Select node, view orbital params
- **Node View** — Enable after selecting a node to ride along with it
