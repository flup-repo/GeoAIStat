import type { ColorRamp } from '../../types/data.ts'

type LegendProps = {
  ramp: ColorRamp
  label: string
}

export function Legend({ ramp, label }: LegendProps) {
  return (
    <div className="legend-card glass-panel">
      <span className="eyebrow">Color scale</span>
      <div
        className="legend-gradient"
        style={{ background: `linear-gradient(90deg, ${ramp.low} 0%, ${ramp.high} 100%)` }}
      />
      <div className="legend-copy">
        <span>Lower signal</span>
        <span>{label}</span>
        <span>Higher signal</span>
      </div>
    </div>
  )
}
