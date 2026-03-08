import { describe, expect, it } from 'vitest'

import { sanitizeQueryState, serializeQueryState } from './queryState.ts'
import type { AppManifest } from '../types/data.ts'

const manifest: AppManifest = {
  appName: 'GeoAIStat',
  generatedAt: '2026-03-08T00:00:00.000Z',
  lastRefresh: '2026-03-08T00:00:00.000Z',
  defaultStoryId: 'coastal-acceleration',
  providers: [
    { id: 'openai', label: 'OpenAI Signals', blurb: 'Consumer and developer adoption snapshots.' },
    { id: 'anthropic', label: 'Anthropic Economic Index', blurb: 'Knowledge work usage distribution.' },
  ],
  datasets: [
    {
      provider: 'openai',
      geoType: 'country',
      metricId: 'consumer_reach',
      metricLabel: 'Consumer reach',
      description: 'Share of public adoption signals by geography.',
      valueType: 'share',
      unit: '%',
      colorRamp: { low: '#16404f', high: '#f59e0b' },
      periods: [
        { id: '2026-01', label: 'Jan 2026', publicationDate: '2026-01-28' },
        { id: '2026-02', label: 'Feb 2026', publicationDate: '2026-02-28' },
      ],
      defaultPeriodId: '2026-02',
      defaultSelection: 'USA',
      checksum: 'abc',
      availableGeographies: ['USA', 'GBR'],
      comparabilityGroup: 'openai_consumer_reach',
    },
    {
      provider: 'anthropic',
      geoType: 'us_state',
      metricId: 'knowledge_work',
      metricLabel: 'Knowledge work intensity',
      description: 'Economic-index style state mix.',
      valueType: 'index',
      colorRamp: { low: '#0e7490', high: '#fb7185' },
      periods: [{ id: '2026-02', label: 'Feb 2026', publicationDate: '2026-02-18' }],
      defaultPeriodId: '2026-02',
      defaultSelection: 'CA',
      checksum: 'def',
      availableGeographies: ['CA', 'NY'],
      comparabilityGroup: 'anthropic_knowledge_work',
    },
  ],
}

describe('query state', () => {
  it('serializes all public URL params', () => {
    expect(
      serializeQueryState({
        provider: 'openai',
        metric: 'consumer_reach',
        period: '2026-02',
        mode: 'world',
        selection: 'USA',
      }),
    ).toBe('?provider=openai&metric=consumer_reach&period=2026-02&mode=world&selection=USA')
  })

  it('falls back to dataset defaults when params are invalid', () => {
    expect(sanitizeQueryState('?provider=missing&mode=us&selection=ZZ', manifest)).toEqual({
      provider: 'openai',
      metric: 'consumer_reach',
      period: '2026-02',
      mode: 'world',
      selection: 'USA',
    })
  })

  it('keeps valid params intact', () => {
    expect(
      sanitizeQueryState(
        '?provider=anthropic&metric=knowledge_work&period=2026-02&mode=us&selection=NY',
        manifest,
      ),
    ).toEqual({
      provider: 'anthropic',
      metric: 'knowledge_work',
      period: '2026-02',
      mode: 'us',
      selection: 'NY',
    })
  })
})
