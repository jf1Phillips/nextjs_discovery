import mapboxgl, { Map as Mapboxgl, LngLatLike } from "mapbox-gl";
import { LABELS_FILENAME } from "../get_map";

export default function add_popup(map: Mapboxgl): void
{
    const id: string = LABELS_FILENAME.replace(/(label|road|geo_map)/gi, "rp");
    map.on("click", id, (e) => {
        if (!e.features || !e.features.length || !map) return;
        const feature = e.features[0];
        if (feature.geometry?.type !== 'Point') return;
        const labelText = feature.properties?.['fr'] || 'Label';
        const coords = feature.geometry.coordinates as LngLatLike;
        const popup = new mapboxgl.Popup({anchor: "left", closeButton: false, offset: [10, -20]})
            .setLngLat(coords)
            .setHTML(`<div style="font-weight:bold;font-size:20px;">${labelText}</div>`)
        popup.on("open", () => {console.log("oe")});
        popup.addTo(map);
    });
}
