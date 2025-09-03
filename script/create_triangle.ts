import { Layer } from "mapbox-gl";

export default function create_triangle(x: number, y: number, id: string) : Layer {
    const triangle: number[][][] = [
        [
            [x, y],
            [x - 0.02, y + 0.03],
            [x + 0.02, y + 0.03],
            [x, y],
        ]
    ];
    const layer = {
            id: id,
            type: "line",
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type:"Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: triangle,
                            },
                            properties: {},
                        },
                    ],
                },
            },
            paint: {
                "line-color": "#865e96",
                "line-width": 3,
                "line-opacity": 1.0,
            },
        };
    return layer as unknown as Layer;
};
