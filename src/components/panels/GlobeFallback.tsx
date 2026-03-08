import type { DatasetArtifact, Observation } from '../../types/data.ts'

type GlobeFallbackProps = {
  dataset: DatasetArtifact
  observations: Observation[]
  selectedObservation?: Observation
}

export function GlobeFallback({ dataset, observations, selectedObservation }: GlobeFallbackProps) {
  return (
    <div className="fallback-panel glass-panel">
      <div className="fallback-copy">
        <span className="eyebrow">Reduced rendering mode</span>
        <h2>{dataset.metricLabel}</h2>
        <p>WebGL is unavailable, so GeoAIStat is showing the same ranking data in a 2D fallback panel.</p>
      </div>

      <div className="fallback-highlight">
        <strong>{selectedObservation?.geoLabel ?? 'No geography selected'}</strong>
        <span>{selectedObservation ? `Rank #${selectedObservation.rank}` : 'Select from the list below.'}</span>
      </div>

      <div className="fallback-list">
        {observations.slice(0, 8).map((observation) => (
          <article key={observation.geoId}>
            <strong>{observation.geoLabel}</strong>
            <span>{Math.round(observation.valueNormalized)}</span>
          </article>
        ))}
      </div>
    </div>
  )
}
