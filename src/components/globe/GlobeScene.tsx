import { Html, Line, OrbitControls, Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'

import { mixHexColors } from '../../lib/colors.ts'
import { latLngToPosition, normalizedToMarkerScale } from '../../lib/globe.ts'
import type { SceneQuality } from '../../lib/scene-quality.ts'
import type { ColorRamp, Observation } from '../../types/data.ts'
import { Atmosphere } from './Atmosphere.tsx'

type GlobeSceneProps = {
  observations: Observation[]
  selectedObservation?: Observation
  hoveredGeoId?: string | null
  onHover: (geoId: string | null) => void
  onSelect: (geoId: string) => void
  colorRamp: ColorRamp
  sceneQuality: SceneQuality
}

function Graticule() {
  const latitudeLines = useMemo(
    () =>
      [-60, -30, 0, 30, 60].map((latitude) =>
        Array.from({ length: 73 }, (_, index) => latLngToPosition(latitude, -180 + index * 5, 1.001)),
      ),
    [],
  )

  const longitudeLines = useMemo(
    () =>
      [-120, -60, 0, 60, 120, 180].map((longitude) =>
        Array.from({ length: 37 }, (_, index) => latLngToPosition(-90 + index * 5, longitude, 1.001)),
      ),
    [],
  )

  return (
    <group>
      {latitudeLines.map((points, index) => (
        <Line key={`lat-${index}`} points={points} color="#2e4c63" transparent opacity={0.35} lineWidth={0.5} />
      ))}
      {longitudeLines.map((points, index) => (
        <Line key={`lng-${index}`} points={points} color="#244356" transparent opacity={0.18} lineWidth={0.5} />
      ))}
    </group>
  )
}

type MarkerProps = {
  observation: Observation
  isSelected: boolean
  isHovered: boolean
  colorRamp: ColorRamp
  onHover: (geoId: string | null) => void
  onSelect: (geoId: string) => void
}

function Marker({ observation, isSelected, isHovered, colorRamp, onHover, onSelect }: MarkerProps) {
  const position = useMemo(
    () => latLngToPosition(observation.latitude, observation.longitude),
    [observation.latitude, observation.longitude],
  )
  const color = mixHexColors(colorRamp.low, colorRamp.high, observation.valueNormalized / 100)
  const scale = normalizedToMarkerScale(observation.valueNormalized)

  return (
    <group
      position={position}
      onPointerEnter={() => onHover(observation.geoId)}
      onPointerLeave={() => onHover(null)}
      onClick={() => onSelect(observation.geoId)}
    >
      {(isSelected || isHovered) && (
        <mesh scale={scale * 2.6}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.18 : 0.1} />
        </mesh>
      )}
      <mesh scale={scale}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.75} roughness={0.35} />
      </mesh>
      <mesh scale={scale * 1.45}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} />
      </mesh>
      {(isHovered || isSelected) && (
        <Html distanceFactor={8} center>
          <div className={`globe-tooltip ${isSelected ? 'is-selected' : ''}`}>
            <span>{observation.geoLabel}</span>
            <strong>{Math.round(observation.valueNormalized)}</strong>
          </div>
        </Html>
      )}
    </group>
  )
}

export function GlobeScene({
  observations,
  selectedObservation,
  hoveredGeoId,
  onHover,
  onSelect,
  colorRamp,
  sceneQuality,
}: GlobeSceneProps) {
  return (
    <div className="globe-stage">
      <Canvas camera={{ fov: 34, position: [0, 0.25, 4.4] }} dpr={[1, 1.8]}>
        <color attach="background" args={['#04070d']} />
        <fog attach="fog" args={['#04070d', 4.2, 8.4]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 1.4, 3]} intensity={2.4} color="#7dd3fc" />
        <pointLight position={[-3, -2, -4]} intensity={1.8} color="#fbbf24" />
        <Stars
          radius={90}
          depth={40}
          count={sceneQuality.starsCount}
          factor={4}
          fade
          saturation={0}
          speed={sceneQuality.reducedMotion ? 0 : 0.5}
        />
        <group rotation={[0.22, 0.9, 0]}>
          <mesh>
            <sphereGeometry args={[1, 96, 96]} />
            <meshPhysicalMaterial
              color="#08111f"
              emissive="#0c2d4c"
              emissiveIntensity={0.56}
              roughness={0.82}
              metalness={0.18}
              clearcoat={0.85}
              clearcoatRoughness={0.4}
            />
          </mesh>
          <Atmosphere />
          <Graticule />
          {observations.map((observation) => (
            <Marker
              key={observation.geoId}
              observation={observation}
              isSelected={selectedObservation?.geoId === observation.geoId}
              isHovered={hoveredGeoId === observation.geoId}
              colorRamp={colorRamp}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
        </group>
        <OrbitControls
          enablePan={false}
          minDistance={2.8}
          maxDistance={6}
          autoRotate={sceneQuality.autoRotate}
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  )
}
