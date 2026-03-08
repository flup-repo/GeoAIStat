import GeoJsonGeometry from 'three-geojson-geometry';

const geojson = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [-74, 40] // [lon, lat]
    }
};

const g = new GeoJsonGeometry(geojson.geometry, 1);
const positions = g.getAttribute('position').array;
console.log("GeoJson point [-74, 40]:", positions[0].toFixed(3), positions[1].toFixed(3), positions[2].toFixed(3));
