import type { PeriodMeta } from '../../types/data.ts'

type TimelineProps = {
  periods: PeriodMeta[]
  activePeriodId: string
  onChange: (periodId: string) => void
}

export function Timeline({ periods, activePeriodId, onChange }: TimelineProps) {
  return (
    <div className="timeline glass-panel">
      <div className="timeline-copy">
        <span className="eyebrow">Playback</span>
        <strong>Published snapshots</strong>
      </div>
      <div className="timeline-track">
        {periods.map((period) => (
          <button
            key={period.id}
            className={period.id === activePeriodId ? 'is-active' : ''}
            onClick={() => onChange(period.id)}
            type="button"
          >
            <span>{period.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
