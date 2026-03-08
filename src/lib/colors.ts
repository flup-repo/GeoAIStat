export function mixHexColors(low: string, high: string, weight: number): string {
  const start = hexToRgb(low)
  const end = hexToRgb(high)
  const ratio = Math.min(1, Math.max(0, weight))
  const channel = (from: number, to: number) => Math.round(from + (to - from) * ratio)

  return `rgb(${channel(start[0], end[0])}, ${channel(start[1], end[1])}, ${channel(start[2], end[2])})`
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : normalized

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ]
}
