import { createRequire } from 'node:module'

import { feature } from 'topojson-client'

import type { GeographyAsset, GeographyFeature, GeographyMode, GeoJsonGeometry } from '../src/types/data.ts'
import { usGeography, worldGeography, type GeographySeed } from './providers/shared.ts'

const require = createRequire(import.meta.url)

const worldTopology = require('world-atlas/countries-110m.json')
const worldFallbackTopology = require('world-atlas/countries-50m.json')
const usTopology = require('us-atlas/states-10m.json')

const worldNameOverrides: Partial<Record<keyof typeof worldGeography, string>> = {
  USA: 'United States of America',
  GBR: 'United Kingdom',
  DEU: 'Germany',
}

function toGeometry(geometry: unknown): GeoJsonGeometry {
  if (
    !geometry ||
    typeof geometry !== 'object' ||
    !('type' in geometry) ||
    !('coordinates' in geometry) ||
    (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')
  ) {
    throw new Error('Unsupported geography geometry payload.')
  }

  return geometry as GeoJsonGeometry
}

function buildFeature(
  geoType: GeographyFeature['geoType'],
  geoId: string,
  seed: GeographySeed,
  geometry: unknown,
): GeographyFeature {
  return {
    geoType,
    geoId,
    geoLabel: seed.label,
    latitude: seed.latitude,
    longitude: seed.longitude,
    geometry: toGeometry(geometry),
  }
}

function buildWorldFeatures(): GeographyFeature[] {
  const collection = feature(worldTopology, worldTopology.objects.countries)
  const fallbackCollection = feature(worldFallbackTopology, worldFallbackTopology.objects.countries)

  return Object.entries(worldGeography).map(([geoId, seed]) => {
    const targetName = worldNameOverrides[geoId as keyof typeof worldGeography] ?? seed.label
    const match =
      collection.features.find((entry) => entry.properties?.name === targetName) ??
      fallbackCollection.features.find((entry) => entry.properties?.name === targetName)

    if (!match?.geometry) {
      throw new Error(`Missing world geometry for ${geoId} (${targetName}).`)
    }

    return buildFeature('country', geoId, seed, match.geometry)
  })
}

function buildUsFeatures(): GeographyFeature[] {
  const collection = feature(usTopology, usTopology.objects.states)
  return Object.entries(usGeography).map(([geoId, seed]) => {
    const match = collection.features.find((entry) => entry.properties?.name === seed.label)
    if (!match?.geometry) {
      throw new Error(`Missing US geometry for ${geoId} (${seed.label}).`)
    }

    return buildFeature('us_state', geoId, seed, match.geometry)
  })
}

export function buildGeographyAssets(generatedAt: string): Record<GeographyMode, GeographyAsset> {
  return {
    world: {
      mode: 'world',
      generatedAt,
      features: buildWorldFeatures(),
    },
    us: {
      mode: 'us',
      generatedAt,
      features: buildUsFeatures(),
    },
  }
}
