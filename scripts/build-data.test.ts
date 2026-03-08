import { mkdtemp, readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildArtifactsFromProviders, writeArtifacts } from './build-data.ts'

describe('build-data', () => {
  it('builds a manifest and dataset artifacts for both scopes', () => {
    const artifacts = buildArtifactsFromProviders('2026-03-08T00:00:00.000Z')

    expect(artifacts.manifest.appName).toBe('GeoAIStat')
    expect(artifacts.manifest.datasets).toHaveLength(8)
    expect(artifacts.datasets['world:openai:consumer_reach'].observations).toHaveLength(30)
    expect(artifacts.datasets['us:anthropic:knowledge_work'].observations).toHaveLength(24)
  })

  it('normalizes and ranks observations within each period', () => {
    const artifacts = buildArtifactsFromProviders('2026-03-08T00:00:00.000Z')
    const dataset = artifacts.datasets['world:openai:consumer_reach']
    const february = dataset.observations
      .filter((entry) => entry.periodId === '2026-02')
      .sort((left, right) => left.rank - right.rank)

    expect(february[0].geoId).toBe('USA')
    expect(february[0].rank).toBe(1)
    expect(february.at(-1)?.geoId).toBe('BRA')
    expect(february.at(-1)?.valueNormalized).toBe(0)
  })

  it('emits local geometry artifacts alongside data outputs', async () => {
    const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'globe-artifacts-'))
    await writeArtifacts(outputRoot, '2026-03-08T00:00:00.000Z')

    const worldGeometry = JSON.parse(await readFile(path.join(outputRoot, 'data', 'geometry', 'world.json'), 'utf8'))
    const usGeometry = JSON.parse(await readFile(path.join(outputRoot, 'data', 'geometry', 'us.json'), 'utf8'))

    expect(worldGeometry.mode).toBe('world')
    expect(worldGeometry.features).toHaveLength(10)
    expect(worldGeometry.features.find((feature: { geoId: string }) => feature.geoId === 'SGP')).toBeTruthy()
    expect(usGeometry.mode).toBe('us')
    expect(usGeometry.features).toHaveLength(8)
  })
})
