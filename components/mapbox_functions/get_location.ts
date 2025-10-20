"use client";

import { Map as MapboxMap, Marker } from "mapbox-gl";

export default function get_location(
    map: MapboxMap | null,
    marker: React.RefObject<Marker | null>,
    loc: boolean,
    setLoc: React.Dispatch<React.SetStateAction<boolean>>,
    watchId: React.RefObject<number | null>
) : void
{
    if (!map) return;
    if (!navigator.geolocation) return;

    if (!loc) {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
        setLoc(false);
        return;
    }
    if (watchId.current === null) {
        watchId.current = navigator.geolocation.watchPosition((p) => {
            const coord: [number, number] = [p.coords.longitude, p.coords.latitude];

            if (!marker.current) {
                marker.current = new Marker()
                    .setLngLat(coord).addTo(map);
            } else {
                marker.current.setLngLat(coord);
            }
            setLoc(true);
        },
        (error) => {
            console.log("Error location: ", error);
            setLoc(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
    }
}
