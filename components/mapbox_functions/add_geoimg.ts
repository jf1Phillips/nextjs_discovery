import { Map as MapBoxMap } from "mapbox-gl";

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

export type Coords = [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
];

type  BaseGeoImg = {
    url: string,
    id: string,
    opacity?: number,
}

type GeoImg =
    |   (BaseGeoImg & {
            type: "image",
            coord: Coords,
        })
    |   (BaseGeoImg & {
            type: "raster",
    });

const ID_PEF: string = "pef1880map";
const ID_HANS: string = "hans1975map";
export {ID_PEF, ID_HANS};

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
    },
    {
        url: "/tiles/{z}/{x}/{y}.webp",
        id: ID_HANS,
        type: "raster",
        opacity: 0.5,
    }
]

export default function addGeoImg(map: MapBoxMap)
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
