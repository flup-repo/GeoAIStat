import GeoJsonGeometry from 'three-geojson-geometry';

const geojson = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [-74.006, 40.7128] // [lon, lat]
    }
};

const g = new GeoJsonGeometry(geojson.geometry, 1);
const positions = g.getAttribute('position').array;
console.log("Point [-74.006, 40.7128] mapped to:", positions[0], positions[1], positions[2]);
