export function latLngToPosition(latitude: number, longitude: number, radius = 1.03): [number, number, number] {
  const phi = ((90 - latitude) * Math.PI) / 180
  const theta = ((longitude + 180) * Math.PI) / 180
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return [x, y, z]
}

export function normalizedToMarkerScale(value: number): number {
  return 0.02 + (value / 100) * 0.05
}
