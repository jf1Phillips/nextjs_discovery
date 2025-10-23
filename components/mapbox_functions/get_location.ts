"use client";
import { Map as MapboxMap, Marker } from "mapbox-gl";

/**
 * Toggles real-time user geolocation tracking on a Mapbox map.
 *
 * When activated, this function continuously updates a marker to follow
 * the user's current position using the browser's Geolocation API.
 * When disabled, it stops tracking, removes the marker, and clears the active watch.
 *
 * @param map - The Mapbox map instance, or `null` if the map is not initialized.
 * @param marker - A React ref holding the current Mapbox `Marker` used to display the user’s position.
 * @param loc - A boolean flag indicating whether location tracking should be active (`true`) or disabled (`false`).
 * @param setLoc - A React state setter used to update the `loc` state when location availability changes.
 * @param watchId - A React ref storing the ID of the active geolocation watch (if any), allowing cleanup or restart.
 *
 * @example
 * // Enable geolocation tracking
 * get_location(map, markerRef, true, setLoc, watchIdRef);
 *
 * @example
 * // Disable geolocation tracking
 * get_location(map, markerRef, false, setLoc, watchIdRef);
 *
 * @remarks
 * - Uses `navigator.geolocation.watchPosition()` to continuously track position.
 * - Ensures only one active watcher exists at a time (cleans up existing watchers before starting new ones).
 * - Automatically removes the user marker and stops watching when `loc` is set to `false`.
 * - Requests high-accuracy positioning with a 5-second timeout and zero cache age.
 * - Safe-guards against missing browser geolocation support.
 */
function get_location(
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
        let available: boolean = true;
        const tmp: number = navigator.geolocation.watchPosition((p) => {
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
            available = false;
            setLoc(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
        if (available) watchId.current = tmp;
    }
}

export default get_location;
