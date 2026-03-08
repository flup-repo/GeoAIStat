export function latLngToPosition(latitude: number, longitude: number, radius = 1.03): [number, number, number] {
  const latRad = latitude * (Math.PI / 180)
  const lngRad = longitude * (Math.PI / 180)

  const x = radius * Math.cos(latRad) * Math.sin(lngRad)
  const y = radius * Math.sin(latRad)
  const z = radius * Math.cos(latRad) * Math.cos(lngRad)

  return [x, y, z]
}

export function normalizedToMarkerScale(value: number): number {
  return 0.02 + (value / 100) * 0.05
}
