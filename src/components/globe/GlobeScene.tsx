import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Suspense, useMemo, useRef, type ReactNode } from 'react'
import GeoJsonGeometry from 'three-geojson-geometry'
import * as THREE from 'three'

import { mixHexColors } from '../../lib/colors.ts'
import { latLngToPosition } from '../../lib/globe.ts'
import type { SceneQuality } from '../../lib/scene-quality.ts'
import type { ColorRamp, GeographyAsset, GeographyFeature, GeographyMode, Observation } from '../../types/data.ts'
import { Atmosphere } from './Atmosphere.tsx'

type GlobeSceneProps = {
  mode: GeographyMode
  geography: GeographyAsset
  observations: Observation[]
  selectedObservation?: Observation
  hoveredGeoId?: string | null
  onHover: (geoId: string | null) => void
  onSelect: (geoId: string) => void
  colorRamp: ColorRamp
  sceneQuality: SceneQuality
}

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
        <Line key={`lat-${index}`} points={points} color="#1b3d5c" transparent opacity={0.24} lineWidth={0.6} />
      ))}
      {longitudeLines.map((points, index) => (
        <Line key={`lng-${index}`} points={points} color="#1b3d5c" transparent opacity={0.18} lineWidth={0.6} />
      ))}
    </group>
  )
}

function CameraRig({ mode, hasSelection }: { mode: GeographyMode; hasSelection: boolean }) {
  useFrame(({ camera }, delta) => {
    const targetPosition =
      mode === 'us'
        ? hasSelection
          ? [0, 0.22, 2.28]
          : [0, 0.24, 2.55]
        : hasSelection
          ? [0, 0.18, 3.08]
          : [0, 0.16, 3.48]

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPosition[0], 4.2, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPosition[1], 4.2, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPosition[2], 4.2, delta)
    camera.lookAt(0, mode === 'us' ? -0.04 : -0.02, 0)
  })

  return null
}

function GlobeRig({
  mode,
  selectedObservation,
  children,
}: {
  mode: GeographyMode
  selectedObservation?: Observation
  children: ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)

  const targetRotation = useMemo(() => {
    if (selectedObservation) {
      const latitude = THREE.MathUtils.degToRad(selectedObservation.latitude)
      const longitude = THREE.MathUtils.degToRad(selectedObservation.longitude)

      return new THREE.Euler(
        latitude + (mode === 'us' ? 0.1 : 0.02),
        -longitude + (mode === 'us' ? 0.34 : 0.18),
        0,
      )
    }

    return mode === 'us' ? new THREE.Euler(0.54, 1.08, 0.04) : new THREE.Euler(0.22, 0.92, 0)
  }, [mode, selectedObservation])

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotation.x, 4.6, delta)
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotation.y, 4.6, delta)
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetRotation.z, 4.6, delta)
  })

  return (
    <group ref={groupRef} position={[0, mode === 'us' ? -0.16 : -0.12, 0]} scale={mode === 'us' ? 1.42 : 1.2}>
      {children}
    </group>
  )
}

function GeographyMarker({
  color,
  feature,
  isSelected,
}: {
  color: string
  feature: GeographyFeature
  isSelected: boolean
}) {
  const haloRef = useRef<THREE.Mesh>(null)
  const position = useMemo(() => latLngToPosition(feature.latitude, feature.longitude, 1.02), [feature])

  useFrame(({ clock }) => {
    if (!haloRef.current) {
      return
    }

    const time = clock.getElapsedTime()
    const scale = isSelected ? 0.12 : 0.09
    haloRef.current.scale.setScalar(scale * (1 + Math.sin(time * 4) * 0.12))
  })

  return (
    <group position={position}>
      <mesh scale={isSelected ? 0.055 : 0.045}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.6} roughness={0.12} />
      </mesh>
      <mesh ref={haloRef} scale={isSelected ? 0.12 : 0.09}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.24 : 0.18} />
      </mesh>
    </group>
  )
}

function GeographyShape({
  colorRamp,
  feature,
  hoveredGeoId,
  observation,
  onHover,
  onSelect,
  selectedGeoId,
}: {
  colorRamp: ColorRamp
  feature: GeographyFeature
  hoveredGeoId: string | null | undefined
  observation?: Observation
  onHover: (geoId: string | null) => void
  onSelect: (geoId: string) => void
  selectedGeoId?: string
}) {
  const surfaceGeometry = useMemo(() => {
    const geometry = new GeoJsonGeometry(feature.geometry, 1.002)
    geometry.computeVertexNormals()
    return geometry
  }, [feature.geometry])

  const edgeGeometry = useMemo(() => new THREE.EdgesGeometry(surfaceGeometry, 25), [surfaceGeometry])
  const anchorPosition = useMemo(
    () => latLngToPosition(feature.latitude, feature.longitude, 1.03),
    [feature.latitude, feature.longitude],
  )

  const isSelected = selectedGeoId === feature.geoId
  const isHovered = hoveredGeoId === feature.geoId
  const normalized = observation?.valueNormalized ?? 0
  const fillColor = observation ? mixHexColors(colorRamp.low, colorRamp.high, normalized / 100) : '#15304a'
  const fillOpacity = observation ? (isSelected ? 0.92 : isHovered ? 0.84 : 0.52 + normalized / 240) : 0.22
  const strokeColor = isSelected ? '#f8fafc' : isHovered ? '#93c5fd' : '#2d77a1'

  return (
    <group>
      <mesh
        geometry={surfaceGeometry}
        onPointerEnter={(event) => {
          event.stopPropagation()
          onHover(feature.geoId)
        }}
        onPointerLeave={(event) => {
          event.stopPropagation()
          onHover(null)
        }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(feature.geoId)
        }}
      >
        <meshStandardMaterial
          color={fillColor}
          emissive={fillColor}
          emissiveIntensity={isSelected ? 0.55 : isHovered ? 0.26 : 0.08}
          transparent
          opacity={fillOpacity}
          roughness={0.8}
          metalness={0.08}
        />
      </mesh>

      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color={strokeColor} transparent opacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.34} depthWrite={false} />
      </lineSegments>

      {(isHovered || isSelected) && observation ? (
        <>
          <GeographyMarker color={fillColor} feature={feature} isSelected={isSelected} />
          <Html position={anchorPosition} distanceFactor={7} center zIndexRange={[100, 0]}>
            <div className={`globe-tooltip ${isSelected ? 'is-selected' : ''}`}>
              <span>{observation.geoLabel}</span>
              <strong style={{ color: fillColor }}>{Math.round(observation.valueNormalized)}</strong>
            </div>
          </Html>
        </>
      ) : null}
    </group>
  )
}

function GeographyLayer({
  colorRamp,
  geography,
  hoveredGeoId,
  observations,
  onHover,
  onSelect,
  selectedGeoId,
}: {
  colorRamp: ColorRamp
  geography: GeographyAsset
  hoveredGeoId: string | null | undefined
  observations: Observation[]
  onHover: (geoId: string | null) => void
  onSelect: (geoId: string) => void
  selectedGeoId?: string
}) {
  const observationsByGeoId = useMemo(
    () => new Map(observations.map((observation) => [observation.geoId, observation])),
    [observations],
  )

  return (
    <group>
      {geography.features.map((feature) => (
        <GeographyShape
          key={feature.geoId}
          colorRamp={colorRamp}
          feature={feature}
          hoveredGeoId={hoveredGeoId}
          observation={observationsByGeoId.get(feature.geoId)}
          onHover={onHover}
          onSelect={onSelect}
          selectedGeoId={selectedGeoId}
        />
      ))}
    </group>
  )
}

export function GlobeScene({
  mode,
  geography,
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
      <Canvas camera={{ fov: 32, position: [0, 0.16, 3.48] }} dpr={[1, 2]} onPointerMissed={() => onHover(null)}>
        <color attach="background" args={['#01040a']} />
        <fog attach="fog" args={['#01040a', 2.8, 7.4]} />
        <ambientLight intensity={1.08} />
        <directionalLight position={[4, 1.8, -1]} intensity={3.5} color="#cff0ff" />
        <pointLight position={[-4, 1, 3]} intensity={2} color="#a6dfff" />
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
        <CameraRig mode={mode} hasSelection={Boolean(selectedObservation)} />
        <Suspense fallback={null}>
          <GlobeRig mode={mode} selectedObservation={selectedObservation}>
            <GlobeBaseSurface />
            <Atmosphere />
            <Graticule />
            <GeographyLayer
              colorRamp={colorRamp}
              geography={geography}
              hoveredGeoId={hoveredGeoId}
              observations={observations}
              onHover={onHover}
              onSelect={onSelect}
              selectedGeoId={selectedObservation?.geoId}
            />
          </GlobeRig>
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.06}
          minDistance={mode === 'us' ? 1.6 : 2.3}
          maxDistance={mode === 'us' ? 3.9 : 5}
          autoRotate={sceneQuality.autoRotate && !selectedObservation && mode === 'world'}
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
