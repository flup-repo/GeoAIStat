import type { AppManifest, GeographyMode, ManifestDataset, ProviderId, StoryPreset } from '../../types/data.ts'

type ControlRailProps = {
  manifest: AppManifest
  datasets: ManifestDataset[]
  provider: ProviderId
  metricId: string
  mode: GeographyMode
  activeStoryId?: string
  onProviderChange: (provider: ProviderId) => void
  onMetricChange: (metricId: string) => void
  onModeChange: (mode: GeographyMode) => void
  stories: StoryPreset[]
  onStorySelect: (storyId: string) => void
}

export function ControlRail({
  manifest,
  datasets,
  provider,
  metricId,
  mode,
  activeStoryId,
  onProviderChange,
  onMetricChange,
  onModeChange,
  stories,
  onStorySelect,
}: ControlRailProps) {
  return (
    <aside className="control-rail glass-panel">
      <div className="brand-lockup">
        <span className="brand-kicker">Cinematic atlas</span>
        <h1>GeoAIStat</h1>
        <p>AI adoption geography across provider-reported country and state snapshots.</p>
      </div>

      <div className="control-group">
        <span className="eyebrow">Provider</span>
        <div className="segmented">
          {manifest.providers.map((entry) => (
            <button
              key={entry.id}
              className={entry.id === provider ? 'is-active' : ''}
              onClick={() => onProviderChange(entry.id)}
              type="button"
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="eyebrow">Scope</span>
        <div className="segmented">
          {(['world', 'us'] as const).map((entry) => (
            <button
              key={entry}
              className={entry === mode ? 'is-active' : ''}
              onClick={() => onModeChange(entry)}
              type="button"
            >
              {entry === 'world' ? 'World' : 'US states'}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="eyebrow">Metric</span>
        <div className="pill-grid">
          {datasets.map((dataset) => (
            <button
              key={dataset.metricId}
              className={dataset.metricId === metricId ? 'is-active' : ''}
              onClick={() => onMetricChange(dataset.metricId)}
              type="button"
            >
              <span>{dataset.metricLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="eyebrow">Preset stories</span>
        <div className="story-stack">
          {stories.map((story) => (
            <button
              key={story.id}
              className={`story-card ${story.id === activeStoryId ? 'is-active' : ''}`}
              onClick={() => onStorySelect(story.id)}
              type="button"
            >
              <strong>{story.kicker}</strong>
              <span>{story.title}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
