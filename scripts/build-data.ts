import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildGeographyAssets } from './geography.ts'
import { anthropicDatasets } from './providers/anthropic.ts'
import { openaiDatasets } from './providers/openai.ts'
import type { ProviderDatasetSeed } from './providers/shared.ts'
import type { AppManifest, DatasetArtifact, GeographyAsset, Observation, StoryPreset } from '../src/types/data.ts'

type BuildArtifacts = {
  manifest: AppManifest
  stories: StoryPreset[]
  datasets: Record<string, DatasetArtifact>
  geography: Record<'world' | 'us', GeographyAsset>
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function checksum(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 12)
}

function sortEntries(entries: [string, number][]): [string, number][] {
  return [...entries].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
}

export function buildDataset(seed: ProviderDatasetSeed, fetchedAt: string): DatasetArtifact {
  const observations: Observation[] = []

  seed.periods.forEach((period) => {
    const values = sortEntries(Object.entries(period.values))
    const onlyValues = values.map((entry) => entry[1])
    const min = Math.min(...onlyValues)
    const max = Math.max(...onlyValues)
    const span = max - min

    values.forEach(([geoId, valueRaw], index) => {
      const geography = seed.geography[geoId]
      observations.push({
        geoType: seed.geoType,
        geoId,
        geoLabel: geography.label,
        latitude: geography.latitude,
        longitude: geography.longitude,
        provider: seed.provider,
        metricId: seed.metricId,
        metricLabel: seed.metricLabel,
        periodId: period.id,
        valueRaw,
        valueNormalized: span === 0 ? 50 : round(((valueRaw - min) / span) * 100),
        rank: index + 1,
        valueType: seed.valueType,
        unit: seed.unit,
        sourceUrl: seed.sourceUrl,
        methodologyUrl: seed.methodologyUrl,
        publicationDate: period.publicationDate,
        fetchedAt,
        comparabilityGroup: seed.comparabilityGroup,
        highlight: geography.highlight,
        insight: geography.insight,
      })
    })
  })

  return {
    provider: seed.provider,
    geoType: seed.geoType,
    metricId: seed.metricId,
    metricLabel: seed.metricLabel,
    description: seed.description,
    valueType: seed.valueType,
    unit: seed.unit,
    colorRamp: seed.colorRamp,
    periods: seed.periods.map(({ id, label, publicationDate }) => ({ id, label, publicationDate })),
    observations,
  }
}

function latestPeriod(dataset: DatasetArtifact) {
  return dataset.periods[dataset.periods.length - 1]
}

function defaultSelection(dataset: DatasetArtifact): string {
  const latest = latestPeriod(dataset)
  return dataset.observations
    .filter((observation) => observation.periodId === latest.id)
    .sort((left, right) => left.rank - right.rank)[0].geoId
}

function buildStories(): StoryPreset[] {
  return [
    {
      id: 'coastal-acceleration',
      kicker: 'US cluster',
      title: 'California keeps the highest composite sample score.',
      description: 'This preset opens the state view where coastal and research-heavy markets lead the current launch dataset.',
      query: {
        provider: 'openai',
        metric: 'consumer_reach',
        period: '2026-02',
        mode: 'us',
        selection: 'CA',
      },
    },
    {
      id: 'dense-global-hubs',
      kicker: 'Global nodes',
      title: 'Singapore surfaces as a dense strategic node.',
      description: 'A compact geography can still rank at the top when the metric emphasizes knowledge-work intensity over raw population.',
      query: {
        provider: 'anthropic',
        metric: 'knowledge_work',
        period: '2026-02',
        mode: 'world',
        selection: 'SGP',
      },
    },
    {
      id: 'developer-belt',
      kicker: 'Engineering depth',
      title: 'Developer-heavy regions remain clustered around a few repeat leaders.',
      description: 'This preset focuses on the higher-depth usage metric rather than broad consumer reach.',
      query: {
        provider: 'openai',
        metric: 'developer_depth',
        period: '2026-02',
        mode: 'world',
        selection: 'USA',
      },
    },
  ]
}

export function buildArtifactsFromProviders(fetchedAt: string = new Date().toISOString()): BuildArtifacts {
  const seeds = [...openaiDatasets, ...anthropicDatasets]
  const datasets = Object.fromEntries(
    seeds.map((seed) => {
      const dataset = buildDataset(seed, fetchedAt)
      const mode = seed.geoType === 'country' ? 'world' : 'us'
      return [`${mode}:${seed.provider}:${seed.metricId}`, dataset]
    }),
  )
  const geography = buildGeographyAssets(fetchedAt)

  const manifest: AppManifest = {
    appName: 'GeoAIStat',
    generatedAt: fetchedAt,
    lastRefresh: fetchedAt,
    defaultStoryId: 'coastal-acceleration',
    providers: [
      {
        id: 'openai',
        label: 'OpenAI Signals',
        blurb: 'Broad public adoption and developer-depth style snapshots.',
      },
      {
        id: 'anthropic',
        label: 'Anthropic Economic Index',
        blurb: 'Knowledge-work and infrastructure-oriented geography slices.',
      },
    ],
    datasets: Object.values(datasets).map((dataset) => {
      const defaultPeriod = latestPeriod(dataset)
      return {
        provider: dataset.provider,
        geoType: dataset.geoType,
        metricId: dataset.metricId,
        metricLabel: dataset.metricLabel,
        description: dataset.description,
        valueType: dataset.valueType,
        unit: dataset.unit,
        colorRamp: dataset.colorRamp,
        periods: dataset.periods,
        defaultPeriodId: defaultPeriod.id,
        defaultSelection: defaultSelection(dataset),
        checksum: checksum(JSON.stringify(dataset)),
        availableGeographies: Array.from(new Set(dataset.observations.map((entry) => entry.geoId))),
        comparabilityGroup: dataset.observations[0]?.comparabilityGroup ?? `${dataset.provider}_${dataset.metricId}`,
      }
    }),
  }

  return {
    manifest,
    stories: buildStories(),
    datasets,
    geography,
  }
}

export async function writeArtifacts(outputRoot: string, fetchedAt: string = new Date().toISOString()) {
  const { manifest, stories, datasets, geography } = buildArtifactsFromProviders(fetchedAt)
  await mkdir(path.join(outputRoot, 'data', 'world', 'openai'), { recursive: true })
  await mkdir(path.join(outputRoot, 'data', 'world', 'anthropic'), { recursive: true })
  await mkdir(path.join(outputRoot, 'data', 'us', 'openai'), { recursive: true })
  await mkdir(path.join(outputRoot, 'data', 'us', 'anthropic'), { recursive: true })
  await mkdir(path.join(outputRoot, 'data', 'geometry'), { recursive: true })

  await writeFile(path.join(outputRoot, 'data', 'manifest.json'), JSON.stringify(manifest, null, 2))
  await writeFile(path.join(outputRoot, 'data', 'stories.json'), JSON.stringify(stories, null, 2))
  await writeFile(path.join(outputRoot, 'data', 'geometry', 'world.json'), JSON.stringify(geography.world, null, 2))
  await writeFile(path.join(outputRoot, 'data', 'geometry', 'us.json'), JSON.stringify(geography.us, null, 2))

  await Promise.all(
    Object.entries(datasets).map(async ([key, dataset]) => {
      const [mode, provider, metricId] = key.split(':')
      await writeFile(
        path.join(outputRoot, 'data', mode, provider, `${metricId}.json`),
        JSON.stringify(dataset, null, 2),
      )
    }),
  )
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  const publicDir = path.resolve(scriptDir, '..', 'public')
  await writeArtifacts(publicDir)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  void main()
}
