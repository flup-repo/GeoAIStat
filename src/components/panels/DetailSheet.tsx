import type { DatasetArtifact, Observation, StoryPreset } from '../../types/data.ts'

type DetailSheetProps = {
  dataset: DatasetArtifact
  observation?: Observation
  history: Observation[]
  activeStory?: StoryPreset
}

function formatValue(observation: Observation | undefined): string {
  if (!observation) {
    return 'Not available'
  }

  if (observation.unit === '%') {
    return `${observation.valueRaw.toFixed(1)}%`
  }

  return observation.unit ? `${observation.valueRaw.toFixed(1)} ${observation.unit}` : observation.valueRaw.toFixed(1)
}

function Sparkline({ history }: { history: Observation[] }) {
  if (history.length === 0) {
    return <div className="sparkline-empty">No historical slice yet.</div>
  }

  const width = 300
  const height = 88
  const padding = 10
  const values = history.map((entry) => entry.valueNormalized)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const path = history
    .map((entry, index) => {
      const x = padding + (index / Math.max(history.length - 1, 1)) * (width - padding * 2)
      const y = height - padding - ((entry.valueNormalized - min) / span) * (height - padding * 2)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Historical sparkline">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#sparkline-gradient)" strokeWidth="4" strokeLinecap="round" />
      {history.map((entry, index) => {
        const x = padding + (index / Math.max(history.length - 1, 1)) * (width - padding * 2)
        const y = height - padding - ((entry.valueNormalized - min) / span) * (height - padding * 2)
        return <circle key={entry.periodId} cx={x} cy={y} r="4" fill="#f8fafc" />
      })}
    </svg>
  )
}

export function DetailSheet({ dataset, observation, history, activeStory }: DetailSheetProps) {
  return (
    <aside className="detail-sheet glass-panel">
      <div className="detail-header">
        <span className="eyebrow">{dataset.metricLabel}</span>
        <h2>{observation?.geoLabel ?? 'Select a geography'}</h2>
        <p>{observation?.highlight ?? dataset.description}</p>
      </div>

      <div className="detail-metric">
        <div>
          <span className="eyebrow">Reported value</span>
          <strong>{formatValue(observation)}</strong>
        </div>
        <div>
          <span className="eyebrow">Relative score</span>
          <strong>{observation ? Math.round(observation.valueNormalized) : '—'}</strong>
        </div>
        <div>
          <span className="eyebrow">Rank</span>
          <strong>{observation ? `#${observation.rank}` : '—'}</strong>
        </div>
      </div>

      <div className="detail-section">
        <span className="eyebrow">Trend</span>
        <Sparkline history={history} />
      </div>

      <div className="detail-section insight-copy">
        <span className="eyebrow">Read</span>
        <p>{observation?.insight ?? 'Use the control rail to change provider, metric, and geography scope.'}</p>
      </div>

      {activeStory ? (
        <div className="detail-section story-spotlight">
          <span className="eyebrow">{activeStory.kicker}</span>
          <p>{activeStory.description}</p>
        </div>
      ) : null}

      <div className="detail-links">
        {observation ? (
          <>
            <a href={observation.sourceUrl} target="_blank" rel="noreferrer">
              Source
            </a>
            <a href={observation.methodologyUrl} target="_blank" rel="noreferrer">
              Methodology
            </a>
          </>
        ) : null}
      </div>
    </aside>
  )
}
