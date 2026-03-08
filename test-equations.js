export function latLngToPositionTest(latitude, longitude, radius = 1) {
    const latRad = latitude * (Math.PI / 180)
    const lngRad = longitude * (Math.PI / 180)

    // Test equation 1
    const x1 = radius * Math.cos(latRad) * Math.sin(lngRad)
    const y1 = radius * Math.sin(latRad)
    const z1 = radius * Math.cos(latRad) * Math.cos(lngRad)

    // Test equation 2
    const phi = ((90 - latitude) * Math.PI) / 180
    const theta = ((longitude + 180) * Math.PI) / 180
    const x2 = -(radius * Math.sin(phi) * Math.cos(theta))
    const z2 = radius * Math.sin(phi) * Math.sin(theta)
    const y2 = radius * Math.cos(phi)

    // Test equation 3 (three-geojson)
    const x3 = radius * Math.cos(latRad) * Math.cos(lngRad)
    const y3 = radius * Math.sin(latRad)
    const z3 = -radius * Math.cos(latRad) * Math.sin(lngRad)

    console.log("Eq 1:", x1.toFixed(3), y1.toFixed(3), z1.toFixed(3))
    console.log("Eq 2:", x2.toFixed(3), y2.toFixed(3), z2.toFixed(3))
    console.log("Eq 3:", x3.toFixed(3), y3.toFixed(3), z3.toFixed(3))
}

latLngToPositionTest(40, -74)
