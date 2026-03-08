import { describe, expect, it } from 'vitest'

import { evaluateRefreshPlan } from './refresh-data.ts'
import type { AppManifest, RefreshConfig } from '../src/types/data.ts'

const config: RefreshConfig = {
  defaultCadenceHours: 168,
  providers: {
    openai: { enabled: true, cadenceHours: 168 },
    anthropic: { enabled: true, cadenceHours: 336 },
  },
}

const manifest: AppManifest = {
  appName: 'GeoAIStat',
  generatedAt: '2026-03-01T00:00:00.000Z',
  lastRefresh: '2026-03-01T00:00:00.000Z',
  defaultStoryId: 'coastal-acceleration',
  providers: [
    { id: 'openai', label: 'OpenAI Signals', blurb: 'Broad public adoption and developer-depth style snapshots.' },
    { id: 'anthropic', label: 'Anthropic Economic Index', blurb: 'Knowledge-work and infrastructure-oriented geography slices.' },
  ],
  datasets: [],
}

describe('refresh-data', () => {
  it('refreshes providers whose cadence elapsed', () => {
    const plan = evaluateRefreshPlan(config, manifest, new Date('2026-03-10T02:00:00.000Z'))

    expect(plan.shouldRefresh).toBe(true)
    expect(plan.decisions.find((decision) => decision.provider === 'openai')?.due).toBe(true)
    expect(plan.decisions.find((decision) => decision.provider === 'anthropic')?.due).toBe(false)
  })

  it('forces a refresh when requested', () => {
    const plan = evaluateRefreshPlan(config, manifest, new Date('2026-03-02T00:00:00.000Z'), true)

    expect(plan.shouldRefresh).toBe(true)
    expect(plan.decisions.every((decision) => decision.due)).toBe(true)
  })
})
