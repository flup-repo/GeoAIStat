import type {
  AppManifest,
  GeographyMode,
  GeoType,
  ManifestDataset,
  QueryState,
} from '../types/data.ts'

export function geoTypeToMode(geoType: GeoType): GeographyMode {
  return geoType === 'country' ? 'world' : 'us'
}

export function modeToGeoType(mode: GeographyMode): GeoType {
  return mode === 'world' ? 'country' : 'us_state'
}

export function serializeQueryState(state: QueryState): string {
  const params = new URLSearchParams()
  params.set('provider', state.provider)
  params.set('metric', state.metric)
  params.set('period', state.period)
  params.set('mode', state.mode)
  params.set('selection', state.selection)
  return `?${params.toString()}`
}

function asSearchParams(search: string | URLSearchParams): URLSearchParams {
  if (search instanceof URLSearchParams) {
    return search
  }

  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
}

function getDatasetsFor(
  manifest: AppManifest,
  provider: string,
  mode: GeographyMode,
): ManifestDataset[] {
  return manifest.datasets.filter(
    (dataset) => dataset.provider === provider && geoTypeToMode(dataset.geoType) === mode,
  )
}

export function findDatasetMeta(
  manifest: AppManifest,
  provider: string,
  metricId: string,
  mode: GeographyMode,
): ManifestDataset | undefined {
  return getDatasetsFor(manifest, provider, mode).find((dataset) => dataset.metricId === metricId)
}

function getFallbackDataset(manifest: AppManifest): ManifestDataset {
  return manifest.datasets[0]
}

export function sanitizeQueryState(
  search: string | URLSearchParams,
  manifest: AppManifest,
): QueryState {
  const params = asSearchParams(search)
  let provider = params.get('provider') ?? getFallbackDataset(manifest).provider
  let mode = (params.get('mode') as GeographyMode | null) ?? geoTypeToMode(getFallbackDataset(manifest).geoType)

  if (!manifest.providers.some((entry) => entry.id === provider)) {
    provider = getFallbackDataset(manifest).provider
  }

  let datasets = getDatasetsFor(manifest, provider, mode)
  if (datasets.length === 0) {
    const fallback = getFallbackDataset(manifest)
    provider = fallback.provider
    mode = geoTypeToMode(fallback.geoType)
    datasets = getDatasetsFor(manifest, provider, mode)
  }

  const requestedMetric = params.get('metric')
  const dataset = datasets.find((entry) => entry.metricId === requestedMetric) ?? datasets[0]
  const requestedPeriod = params.get('period')
  const requestedSelection = params.get('selection')
  const period =
    requestedPeriod && dataset.periods.some((entry) => entry.id === requestedPeriod)
      ? requestedPeriod
      : dataset.defaultPeriodId
  const selection =
    requestedSelection && dataset.availableGeographies.includes(requestedSelection)
      ? requestedSelection
      : dataset.defaultSelection

  return {
    provider: dataset.provider,
    metric: dataset.metricId,
    period,
    mode: geoTypeToMode(dataset.geoType),
    selection,
  }
}
