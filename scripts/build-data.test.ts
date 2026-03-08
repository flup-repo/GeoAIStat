import { describe, expect, it } from 'vitest'

import { buildArtifactsFromProviders } from './build-data.ts'

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
})
