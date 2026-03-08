export function latLngToPosition(latitude, longitude, radius = 1) {
    const phi = ((90 - latitude) * Math.PI) / 180
    const theta = ((longitude + 180) * Math.PI) / 180
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    return [x, y, z]
}

const pos = latLngToPosition(40.7128, -74.006)
console.log("My func mapped to: ", pos[0], pos[1], pos[2])
