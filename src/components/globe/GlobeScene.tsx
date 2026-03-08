import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'

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

import { useEffect, useState, Suspense } from 'react'
import GeoJsonGeometry from 'three-geojson-geometry'

function GlobeBaseSurface() {
  const bumpMap = useTexture('/earth-topology.png')

  return (
    <mesh>
      <sphereGeometry args={[1, 128, 128]} />
      <meshPhysicalMaterial
        color="#020712"
        emissive="#061c3b"
        emissiveIntensity={0.25}
        bumpMap={bumpMap}
        bumpScale={0.015}
        roughness={0.88}
        metalness={0.08}
        clearcoat={0.92}
        clearcoatRoughness={0.35}
      />
    </mesh>
  )
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
        <Line key={`lat-${index}`} points={points} color="#1b3d5c" transparent opacity={0.3} lineWidth={0.6} />
      ))}
      {longitudeLines.map((points, index) => (
        <Line key={`lng-${index}`} points={points} color="#1b3d5c" transparent opacity={0.25} lineWidth={0.6} />
      ))}
    </group>
  )
}

function Continents() {
  const [geometries, setGeometries] = useState<THREE.BufferGeometry[]>([])

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((geojson) => {
        const geos: THREE.BufferGeometry[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geojson.features.forEach((feature: any) => {
          if (!feature || !feature.geometry) return
          try {
            const geom = new GeoJsonGeometry(feature.geometry, 1.0005)
            if (geom.attributes.position && geom.attributes.position.count > 0) {
              geos.push(geom)
            }
          } catch {
            // ignore malformed geometries
          }
        })
        setGeometries(geos)
      })
      .catch((err) => console.error('Failed to load continents', err))
  }, [])

  return (
    <group>
      {geometries.map((geometry, i) => (
        <lineSegments key={i} geometry={geometry}>
          <lineBasicMaterial color="#308ab5" transparent opacity={0.4} depthWrite={false} />
        </lineSegments>
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
    () => latLngToPosition(observation.latitude, observation.longitude, 1.002),
    [observation.latitude, observation.longitude],
  )
  const color = mixHexColors(colorRamp.low, colorRamp.high, observation.valueNormalized / 100)
  const scale = normalizedToMarkerScale(observation.valueNormalized)

  const pulseRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (pulseRef.current && (isSelected || isHovered)) {
      const time = clock.getElapsedTime()
      pulseRef.current.scale.setScalar(scale * 1.45 * (1 + Math.sin(time * 4) * 0.15))
    }
  })

  return (
    <group
      position={position}
      onPointerEnter={(e) => {
        e.stopPropagation()
        onHover(observation.geoId)
      }}
      onPointerLeave={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(observation.geoId)
      }}
    >
      {(isSelected || isHovered) && (
        <mesh scale={scale * 2.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.28 : 0.14} />
        </mesh>
      )}
      <mesh scale={scale}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.5} roughness={0.15} />
      </mesh>
      <mesh ref={pulseRef} scale={scale * 1.45}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      {(isHovered || isSelected) && (
        <Html distanceFactor={8} center zIndexRange={[100, 0]}>
          <div className={`globe-tooltip ${isSelected ? 'is-selected' : ''}`}>
            <span>{observation.geoLabel}</span>
            <strong style={{ color }}>{Math.round(observation.valueNormalized)}</strong>
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
      <Canvas camera={{ fov: 32, position: [0, 0.16, 3.55] }} dpr={[1, 2]}>
        <color attach="background" args={['#01040a']} />
        <fog attach="fog" args={['#01040a', 2.8, 7.4]} />
        <ambientLight intensity={1.1} />
        {/* Rim light simulating sun behind/off-side */}
        <directionalLight position={[4, 1.8, -1]} intensity={3.5} color="#cff0ff" />
        {/* Fill light coming from left/front */}
        <pointLight position={[-4, 1, 3]} intensity={2.0} color="#a6dfff" />
        {/* Subdued under light */}
        <pointLight position={[0, -5, 2]} intensity={0.5} color="#4fb0eb" />
        <Stars
          radius={120}
          depth={60}
          count={sceneQuality.starsCount}
          factor={4}
          fade
          saturation={0.5}
          speed={sceneQuality.reducedMotion ? 0 : 0.6}
        />
        <Suspense fallback={null}>
          <group position={[0, -0.12, 0]} rotation={[0.22, 0.92, 0]} scale={1.2}>
            <GlobeBaseSurface />
            <Atmosphere />
            <Graticule />
            <Continents />
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
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.06}
          minDistance={1.2}
          maxDistance={5.0}
          autoRotate={sceneQuality.autoRotate}
          autoRotateSpeed={0.34}
        />
        {sceneQuality.webgl && !sceneQuality.reducedMotion && (
          <EffectComposer>
            <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.9} height={300} intensity={1.3} />
            <Vignette eskil={false} offset={0.12} darkness={1.1} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
