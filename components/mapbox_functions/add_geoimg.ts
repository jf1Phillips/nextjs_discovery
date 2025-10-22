import { Map as MapBoxMap } from "mapbox-gl";
import { GEOMAP_FOLDER, GEOMAP_NAME } from "../get_map";

export function addRoads(url_given: string, map: MapBoxMap)
{
    if (!map.getSource(url_given)) {
        map.addSource(url_given, {
            type: 'geojson',
            data: url_given
        });
    }
    if (!map.getLayer(url_given)) {
        map.addLayer({
            id: url_given,
            type: 'line',
            source: url_given,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#8a898b',
                'line-width': 2,
                'line-opacity': 1.0,
            }
        });
    }
}

export type Coords = [[number, number], [number, number], [number, number], [number, number]];

type GeoImg =
    |   {
            url: string,
            id: string,
            type: "image",
            coord: Coords,
        }
    |   {
            url: string,
            id: string,
            type: "raster",
    };

const coord_new_map: Coords = [
    [34.120542941238725 + 0.008, 33.46703792406347 + 0.003],
    [35.7498100593699 + 0.008, 33.46703792406347 + 0.003],
    [35.7498100593699 + 0.008, 31.10529446421723 - 0.0058],
    [34.120542941238725 + 0.008, 31.10529446421723 - 0.0058],
];
// const GEOMAP_FOLDER: string = "/img/geo_map";
// const GEOMAP_NAME: string = "geo_map_";
// const NEWMAP_NAME: string = "new_map.jpg";
const ID_PEF: string = "pef1880map";
const ID_HANS: string = "hans1975map";
export {ID_PEF, ID_HANS};

const default_coord: Coords =
[
    [33.6791210, 33.6868944 + 0.007], // ╭
    [36.6262031, 33.6868944 + 0.007], //  ╮
    [36.6262031, 31.1730673 + 0.007], //  ╯
    [33.6791210, 31.1730673 + 0.007], // ╰
];

const geoImgArray: GeoImg[] = [
    {
        url: "/img/geo_map/pef_1880_map.jpg",
        id: ID_PEF,
        type: "image",
        coord: [
            [34.120542941238725 + 0.008, 33.46703792406347 + 0.003],
            [35.7498100593699 + 0.008, 33.46703792406347 + 0.003],
            [35.7498100593699 + 0.008, 31.10529446421723 - 0.0058],
            [34.120542941238725 + 0.008, 31.10529446421723 - 0.0058],
        ],
    }
]

export default function addGeoImg(url_given: string, map: MapBoxMap, coords ?: Coords)
{
    const url = (url_given.includes("es.jpg")) ? `${GEOMAP_FOLDER}/${GEOMAP_NAME}fr.jpg` : url_given;
    const coordinates: Coords = !coords ? default_coord : coords;
    const labelLayers = map.getStyle().layers.filter(l => l.id.includes('admin'));
    const firstLabel = labelLayers.length ? labelLayers[0].id : undefined;

    if (!map.getSource(url)) {
        if (url.includes(GEOMAP_NAME)) {
            map.addSource(url, {
                type: "raster",
                tiles: [
                    '/tiles/{z}/{x}/{y}.webp'
                ],
                tileSize: 256,
                minzoom: 6,
                maxzoom: 13,
            });
        } else {
            map.addSource(url, {
                type: 'image',
                url: url,
                coordinates: coordinates,
            });
        }
    }
    if (!map.getLayer(url)) {
        map.addLayer({
            id: url,
            type: 'raster',
            source: url,
            paint: {
                'raster-opacity': !coords ? 0.5 : 0.0,
            }
        }, firstLabel);
    }
}
