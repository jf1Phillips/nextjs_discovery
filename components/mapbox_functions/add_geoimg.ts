import { Map as MapBoxMap } from "mapbox-gl";

/**
 * Geographic coordinates of an image placed on a map.
 *
 * Each element represents a corner of the image, in the following order:
 * - [0]: top-left corner
 * - [1]: top-right corner
 * - [2]: bottom-right corner
 * - [3]: bottom-left corner
 *
 * Each pair follows the `[longitude, latitude]` format.
 */
export type Coords = [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
];

/**
 * Common properties shared by all geographic image types.
 */
type BaseGeoImg = {
    /** Resource URL (image or raster). */
    url: string,
    /** Unique identifier for this resource. */
    id: string,
    /** Optional opacity value, between 0 (fully transparent) and 1 (fully opaque). */
    opacity?: number,
}

/**
 * Represents a geographic image resource.
 *
 * This type can represent two different kinds of resources:
 *
 * - **Image overlay** (`type: "image"`)
 *   An image placed on the map using specific geographic coordinates
 *   that define its corners (`coord`).
 *
 * - **Raster layer** (`type: "raster"`)
 *   A tiled raster source, typically used for maps or aerial imagery.
 *
 * Both variants share common properties defined in `BaseGeoImg`:
 * - `url`: the resource URL (image or raster)
 * - `id`: a unique identifier for this resource
 * - `opacity` (optional): transparency between `0` (transparent) and `1` (opaque)
 */
export type GeoImg =
    |   (BaseGeoImg & {
            /** Type discriminator — indicates this is a single image overlay. */
            type: "image",
            /** Geographic coordinates of the four corners of the image. */
            coord: Coords,
        })
    |   (BaseGeoImg & {
            /** Type discriminator — indicates this is a raster layer. */
            type: "raster",
    });

/**
 * Adds geographic images or raster layers to a Mapbox map.
 *
 * This function iterates over an array of `GeoImg` objects and adds each one
 * as a Mapbox source and layer, if it does not already exist on the map.
 *
 * - For `type: "image"`: adds a single image overlay using geographic coordinates.
 * - For `type: "raster"`: adds a raster tile source with zoom levels 6–13.
 *
 * The layers are inserted below the first label layer found (`admin` labels)
 * if such a layer exists, to ensure proper rendering order.
 *
 * @param map - The Mapbox map instance to add the images to.
 * @param geoImgArray - An array of geographic images or raster layers to add.
 *
 * @example
 * ```ts
 * addGeoImg(map, [
 *   {
 *     id: "satellite-layer",
 *     type: "raster",
 *     url: "https://example.com/tiles/{z}/{x}/{y}.png",
 *     opacity: 0.7
 *   },
 *   {
 *     id: "overlay-image",
 *     type: "image",
 *     url: "https://example.com/image.png",
 *     coord: [
 *       [-74, 40.7],
 *       [-74, 40.8],
 *       [-73.9, 40.8],
 *       [-73.9, 40.7]
 *     ]
 *   }
 * ]);
 * ```
 */
export default function addGeoImg(map: MapBoxMap, geoImgArray: GeoImg[])
{
    const labelLayers = map.getStyle().layers.filter(l => l.id.includes('admin'));
    const firstLabel = labelLayers.length ? labelLayers[0].id : undefined;

    geoImgArray.forEach((geomap) => {
        if (!map.getSource(geomap.id)) {
            if (geomap.type === "raster") {
                map.addSource(geomap.id, {
                    type: "raster",
                    tiles: [
                        geomap.url
                    ],
                    tileSize: 256,
                    minzoom: 6,
                    maxzoom: 13,
                });
            }
            if (geomap.type === "image") {
                map.addSource(geomap.id, {
                    type: "image",
                    url: geomap.url,
                    coordinates: geomap.coord,
                });
            }
        }
        if (!map.getLayer(geomap.id)) {
            map.addLayer({
                id: geomap.id,
                type: "raster",
                source: geomap.id,
                paint: {
                    "raster-opacity": geomap.opacity ? geomap.opacity : 0.0,
                }
            }, firstLabel);
        }
    });
}
