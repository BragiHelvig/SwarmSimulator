import { useSimulation } from '@/store/useSimulationStore'
import { Star } from './Star'
import { SolarSystem } from './SolarSystem'
import { SwarmNodes } from './SwarmNodes'
import { LagrangePoints } from './LagrangePoints'
import { AsteroidBelt } from './AsteroidBelt'
import { OrbitalTrail } from './OrbitalTrail'
import { CoordinateGrid } from './CoordinateGrid'

export function SimulationScene() {
  const { state } = useSimulation()
  const { settings } = state

  return (
    <>
      <Star />
      <SolarSystem />
      <SwarmNodes />
      {settings.showOrbitalTrails && <OrbitalTrail />}
      {settings.showLagrangePoints && <LagrangePoints />}
      {settings.showAsteroidBelt && <AsteroidBelt />}
      {settings.showCoordinateGrid && <CoordinateGrid />}
    </>
  )
}
