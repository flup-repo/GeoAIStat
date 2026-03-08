export function latLngToPosition(latitude, longitude, radius = 1) {
    const latRad = latitude * (Math.PI / 180);
    const lngRad = longitude * (Math.PI / 180);

    const x = radius * Math.cos(latRad) * Math.sin(lngRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.cos(lngRad);

    return [x, y, z];
}

const pos = latLngToPosition(40.7128, -74.006)
console.log("My func mapped to: ", pos[0], pos[1], pos[2])
