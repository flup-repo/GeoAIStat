import { lazy, startTransition, Suspense, useEffect, useMemo, useState } from 'react'

import { ControlRail } from './components/panels/ControlRail.tsx'
import { DetailSheet } from './components/panels/DetailSheet.tsx'
import { GlobeFallback } from './components/panels/GlobeFallback.tsx'
import { Legend } from './components/panels/Legend.tsx'
import { Timeline } from './components/panels/Timeline.tsx'
import { loadDataset, loadManifest, loadStories } from './lib/data.ts'
import { sanitizeQueryState, serializeQueryState } from './lib/queryState.ts'
import { detectSceneQuality } from './lib/scene-quality.ts'
import type {
  AppManifest,
  DatasetArtifact,
  ManifestDataset,
  Observation,
  ProviderId,
  QueryState,
  StoryPreset,
} from './types/data.ts'

const GlobeScene = lazy(async () => {
  const module = await import('./components/globe/GlobeScene.tsx')
  return { default: module.GlobeScene }
})

function App() {
  const [manifest, setManifest] = useState<AppManifest | null>(null)
  const [stories, setStories] = useState<StoryPreset[]>([])
  const [queryState, setQueryState] = useState<QueryState | null>(null)
  const [dataset, setDataset] = useState<DatasetArtifact | null>(null)
  const [hoveredGeoId, setHoveredGeoId] = useState<string | null>(null)
  const [sceneQuality] = useState(() => detectSceneQuality())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const [loadedManifest, loadedStories] = await Promise.all([loadManifest(), loadStories()])
        setManifest(loadedManifest)
        setStories(loadedStories)
        setQueryState(sanitizeQueryState(window.location.search, loadedManifest))
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to initialize GeoAIStat.')
      }
    }

    void bootstrap()
  }, [])

  useEffect(() => {
    if (!manifest) {
      return undefined
    }

    const handlePopState = () => {
      startTransition(() => {
        setQueryState(sanitizeQueryState(window.location.search, manifest))
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [manifest])

  useEffect(() => {
    if (!queryState || !manifest) {
      return
    }

    const activeQuery = queryState
    const nextUrl = serializeQueryState(activeQuery)
    if (nextUrl !== `${window.location.search || '?'}`) {
      window.history.replaceState({}, '', nextUrl)
    }

    async function loadCurrentDataset() {
      try {
        const loadedDataset = await loadDataset(activeQuery.mode, activeQuery.provider, activeQuery.metric)
        setDataset(loadedDataset)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load dataset.')
      }
    }

    void loadCurrentDataset()
  }, [manifest, queryState])

  const currentDatasetMeta = useMemo<ManifestDataset | undefined>(() => {
    if (!manifest || !queryState) {
      return undefined
    }

    return manifest.datasets.find(
      (entry) =>
        entry.provider === queryState.provider &&
        entry.metricId === queryState.metric &&
        (queryState.mode === 'world' ? entry.geoType === 'country' : entry.geoType === 'us_state'),
    )
  }, [manifest, queryState])

  const providerDatasets = useMemo(() => {
    if (!manifest || !queryState) {
      return []
    }

    return manifest.datasets.filter(
      (entry) =>
        entry.provider === queryState.provider &&
        (queryState.mode === 'world' ? entry.geoType === 'country' : entry.geoType === 'us_state'),
    )
  }, [manifest, queryState])

  const periodObservations = useMemo(() => {
    if (!dataset || !queryState) {
      return []
    }

    return dataset.observations
      .filter((entry) => entry.periodId === queryState.period)
      .sort((left, right) => left.rank - right.rank)
  }, [dataset, queryState])

  const selectedObservation = useMemo<Observation | undefined>(() => {
    if (!queryState) {
      return undefined
    }

    return periodObservations.find((entry) => entry.geoId === queryState.selection)
  }, [periodObservations, queryState])

  const selectedHistory = useMemo(() => {
    if (!dataset || !queryState) {
      return []
    }

    return dataset.observations
      .filter((entry) => entry.geoId === queryState.selection)
      .sort((left, right) => left.periodId.localeCompare(right.periodId))
  }, [dataset, queryState])

  const activeStory = useMemo(() => {
    if (!queryState) {
      return undefined
    }

    return stories.find(
      (story) =>
        story.query.provider === queryState.provider &&
        story.query.metric === queryState.metric &&
        story.query.mode === queryState.mode &&
        story.query.selection === queryState.selection &&
        story.query.period === queryState.period,
    )
  }, [queryState, stories])

  function patchQueryState(next: Partial<QueryState>) {
    if (!manifest || !queryState) {
      return
    }

    startTransition(() => {
      const params = new URLSearchParams(serializeQueryState({ ...queryState, ...next }))
      setQueryState(sanitizeQueryState(params, manifest))
    })
  }

  if (error) {
    return (
      <main className="app-shell loading-shell">
        <div className="glass-panel status-card">
          <span className="eyebrow">GeoAIStat</span>
          <h1>App boot failed</h1>
          <p>{error}</p>
        </div>
      </main>
    )
  }

  if (!manifest || !queryState || !dataset || !currentDatasetMeta) {
    return (
      <main className="app-shell loading-shell">
        <div className="glass-panel status-card">
          <span className="eyebrow">GeoAIStat</span>
          <h1>Loading atlas</h1>
          <p>Preparing the first GeoAIStat scene and data snapshot.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />
      <div className="grain-overlay" />

      <ControlRail
        manifest={manifest}
        datasets={providerDatasets}
        provider={queryState.provider}
        metricId={queryState.metric}
        mode={queryState.mode}
        activeStoryId={activeStory?.id}
        onProviderChange={(provider) => patchQueryState({ provider: provider as ProviderId })}
        onMetricChange={(metric) => patchQueryState({ metric, selection: currentDatasetMeta.defaultSelection })}
        onModeChange={(mode) => patchQueryState({ mode, selection: currentDatasetMeta.defaultSelection })}
        stories={stories}
        onStorySelect={(storyId) => {
          const story = stories.find((entry) => entry.id === storyId)
          if (!story) {
            return
          }
          startTransition(() => {
            setQueryState(story.query)
          })
        }}
      />

      <section className="globe-column">
        <header className="hero-copy">
          <span className="eyebrow">Launch slice</span>
          <h2>Provider-reported adoption, staged as an editorial instrument.</h2>
          <p>
            This first implementation uses processed static artifacts and URL-synced controls so the product can be
            verified locally before live refresh automation is wired in.
          </p>
        </header>

        {sceneQuality.webgl ? (
          <Suspense
            fallback={
              <div className="fallback-panel glass-panel">
                <div className="fallback-copy">
                  <span className="eyebrow">Loading scene</span>
                  <h2>Rendering globe</h2>
                  <p>Preparing the Three.js scene chunk for the current dataset.</p>
                </div>
              </div>
            }
          >
            <GlobeScene
              observations={periodObservations}
              selectedObservation={selectedObservation}
              hoveredGeoId={hoveredGeoId}
              onHover={setHoveredGeoId}
              onSelect={(geoId) => patchQueryState({ selection: geoId })}
              colorRamp={dataset.colorRamp}
              sceneQuality={sceneQuality}
            />
          </Suspense>
        ) : (
          <GlobeFallback dataset={dataset} observations={periodObservations} selectedObservation={selectedObservation} />
        )}

        <Legend ramp={dataset.colorRamp} label={dataset.metricLabel} />
        <Timeline periods={dataset.periods} activePeriodId={queryState.period} onChange={(period) => patchQueryState({ period })} />
      </section>

      <DetailSheet dataset={dataset} observation={selectedObservation} history={selectedHistory} activeStory={activeStory} />
    </main>
  )
}

export default App
