import type { ZodType } from 'zod'

import {
  appManifestSchema,
  datasetArtifactSchema,
  storyCollectionSchema,
  type AppManifest,
  type DatasetArtifact,
  type GeographyMode,
  type ProviderId,
  type StoryPreset,
} from '../types/data.ts'

let manifestPromise: Promise<AppManifest> | null = null
let storiesPromise: Promise<StoryPreset[]> | null = null
const datasetCache = new Map<string, Promise<DatasetArtifact>>()

async function fetchAndParse<T>(path: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`)
  }

  return schema.parse(await response.json())
}

export function loadManifest(): Promise<AppManifest> {
  manifestPromise ??= fetchAndParse('/data/manifest.json', appManifestSchema)
  return manifestPromise
}

export function loadStories(): Promise<StoryPreset[]> {
  storiesPromise ??= fetchAndParse('/data/stories.json', storyCollectionSchema)
  return storiesPromise
}

export function loadDataset(
  mode: GeographyMode,
  provider: ProviderId,
  metricId: string,
): Promise<DatasetArtifact> {
  const key = `${mode}:${provider}:${metricId}`
  if (!datasetCache.has(key)) {
    datasetCache.set(
      key,
      fetchAndParse(`/data/${mode}/${provider}/${metricId}.json`, datasetArtifactSchema),
    )
  }

  return datasetCache.get(key) as Promise<DatasetArtifact>
}
