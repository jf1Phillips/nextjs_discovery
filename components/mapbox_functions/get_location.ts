"use client";

import { Map as MapboxMap, Marker } from "mapbox-gl";

export default function get_location(
    map: MapboxMap | null,
    marker: React.RefObject<Marker | null>) : void
{
    if (!map) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((p) => {
        const coord: [number, number] = [p.coords.longitude, p.coords.latitude]
        if (!marker.current) {
            marker.current = new Marker()
                .setLngLat(coord).addTo(map);
        } else {
            marker.current.setLngLat(coord);
        }
    });
}
