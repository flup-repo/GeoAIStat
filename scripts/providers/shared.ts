import type { ColorRamp, GeoType, ProviderId, ValueType } from '../../src/types/data.ts'

export type GeographySeed = {
  label: string
  latitude: number
  longitude: number
  highlight: string
  insight: string
}

export type ProviderPeriodSeed = {
  id: string
  label: string
  publicationDate: string
  values: Record<string, number>
}

export type ProviderDatasetSeed = {
  provider: ProviderId
  geoType: GeoType
  metricId: string
  metricLabel: string
  description: string
  valueType: ValueType
  unit?: string
  comparabilityGroup: string
  colorRamp: ColorRamp
  sourceUrl: string
  methodologyUrl: string
  geography: Record<string, GeographySeed>
  periods: ProviderPeriodSeed[]
}

export const worldGeography: Record<string, GeographySeed> = {
  USA: {
    label: 'United States',
    latitude: 39.8,
    longitude: -98.6,
    highlight: 'The US remains the most saturated market in this sample slice.',
    insight: 'Usage depth stays broad across consumer and developer signals, with steady gains across each snapshot.',
  },
  CAN: {
    label: 'Canada',
    latitude: 56.1,
    longitude: -106.3,
    highlight: 'Canada tracks close to the US, but with a slightly softer slope.',
    insight: 'The pattern suggests high literacy and stable usage rather than abrupt breakout spikes.',
  },
  GBR: {
    label: 'United Kingdom',
    latitude: 55.3,
    longitude: -3.4,
    highlight: 'The UK remains one of the highest-density European nodes.',
    insight: 'Strong service-sector mix and English-language adoption make the UK a persistent high-signal market.',
  },
  FRA: {
    label: 'France',
    latitude: 46.2,
    longitude: 2.2,
    highlight: 'France shows consistent momentum across the latest sample windows.',
    insight: 'The curve is not top-tier yet, but the direction is stable and above the middle of the pack.',
  },
  DEU: {
    label: 'Germany',
    latitude: 51.2,
    longitude: 10.4,
    highlight: 'Germany sits in the upper-middle cluster with a deliberate climb.',
    insight: 'The index shape suggests broad experimentation that is converting into durable usage.',
  },
  IND: {
    label: 'India',
    latitude: 20.6,
    longitude: 78.9,
    highlight: 'India combines scale and acceleration in the current sample.',
    insight: 'The underlying signal points to high demand expansion, especially in developer and student-heavy segments.',
  },
  JPN: {
    label: 'Japan',
    latitude: 36.2,
    longitude: 138.3,
    highlight: 'Japan is climbing from a lower base with a more measured adoption rhythm.',
    insight: 'Growth is visible, but the shape remains more incremental than the fastest-moving markets.',
  },
  BRA: {
    label: 'Brazil',
    latitude: -14.2,
    longitude: -51.9,
    highlight: 'Brazil is one of the clearer Latin American risers in this local build.',
    insight: 'It stays below the top cluster, but the slope is still positive across the full run.',
  },
  AUS: {
    label: 'Australia',
    latitude: -25.3,
    longitude: 133.8,
    highlight: 'Australia remains compact but high-performing.',
    insight: 'The signal is more about depth and consistency than sheer population scale.',
  },
  SGP: {
    label: 'Singapore',
    latitude: 1.35,
    longitude: 103.8,
    highlight: 'Singapore appears as a dense strategic node in both provider views.',
    insight: 'Its small footprint hides outsized intensity, especially in knowledge-work-oriented metrics.',
  },
}

export const usGeography: Record<string, GeographySeed> = {
  CA: {
    label: 'California',
    latitude: 36.7,
    longitude: -119.4,
    highlight: 'California remains the strongest state-level node across most sample metrics.',
    insight: 'The density reflects the combined effect of consumer scale, startups, and enterprise experimentation.',
  },
  NY: {
    label: 'New York',
    latitude: 42.9,
    longitude: -75.5,
    highlight: 'New York keeps strong score density anchored by media, finance, and services.',
    insight: 'The state sits near the top, but with a slightly flatter trajectory than California.',
  },
  TX: {
    label: 'Texas',
    latitude: 31.1,
    longitude: -99.3,
    highlight: 'Texas shows persistent broadening in the sample, not just isolated spikes.',
    insight: 'The growth pattern implies distributed adoption rather than a single-sector surge.',
  },
  WA: {
    label: 'Washington',
    latitude: 47.4,
    longitude: -120.7,
    highlight: 'Washington stays compact and highly efficient in signal density.',
    insight: 'It performs above what its population alone would imply, especially in developer-heavy metrics.',
  },
  MA: {
    label: 'Massachusetts',
    latitude: 42.3,
    longitude: -71.8,
    highlight: 'Massachusetts carries strong research and knowledge-work intensity.',
    insight: 'The shape is defined by concentration and sophistication rather than breadth.',
  },
  VA: {
    label: 'Virginia',
    latitude: 37.5,
    longitude: -78.8,
    highlight: 'Virginia rises as a solid secondary cluster in this v1 sample.',
    insight: 'Public-sector adjacency and enterprise usage keep the state in the upper tier.',
  },
  IL: {
    label: 'Illinois',
    latitude: 40,
    longitude: -89.2,
    highlight: 'Illinois lands in the middle band with consistent growth.',
    insight: 'The movement is steady, showing sustained gains rather than abrupt breakout behavior.',
  },
  CO: {
    label: 'Colorado',
    latitude: 39,
    longitude: -105.5,
    highlight: 'Colorado is a lighter but quickly intensifying state-level node.',
    insight: 'The profile fits a market that is still expanding reach while deepening advanced usage.',
  },
}
