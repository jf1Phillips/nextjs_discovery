import { Map as MapboxMap } from "mapbox-gl";

type Icon = {
    url: string;
    id: string;
}
export type GeoJsonLabels = {
    url: string;
    id: string;
    icons: {
        white: Icon;
        dark: Icon;
        selected: Icon;
    };
};

export function setDarkmodeToLabels(map: MapboxMap, labels: GeoJsonLabels[], darkmode: boolean): void {
    labels.forEach((label) => {
        if (!map.getLayer(label.id)) return;
        map.setPaintProperty(label.id, 'text-color',
            darkmode ? '#ffffff' : '#000000');
        map.setPaintProperty(label.id, 'text-halo-color',
            darkmode ? '#000000' : '#ffffff');
        map.setLayoutProperty(label.id, 'icon-image',
            darkmode ? label.icons.white.id : label.icons.dark.id);
    });
}

export default function addGeoJsonLabels(map: MapboxMap, labels: GeoJsonLabels[]): void {
    const loadingIcons = new Set<string>();

    labels.forEach((label) => {
        Object.values(label.icons).forEach((icon) => {
            if (map.hasImage(icon.id) || loadingIcons.has(icon.id)) return;
            loadingIcons.add(icon.id);
            map.loadImage(icon.url, (error, image) => {
                if (error || !image) return;
                if (!map.hasImage(icon.id))
                    map.addImage(icon.id, image);
            });
        });

        if (!map.getSource(label.id)) {
            map.addSource(label.id, {type: "geojson", data: label.url});
        }
        if (!map.getLayer(label.id)) {
            map.addLayer({
                id: label.id,
                type: 'symbol',
                source: label.id,
                layout: {
                    'icon-image': label.icons.dark.id,
                    'icon-allow-overlap': true,
                    'text-field': ['get', 'fr'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': ['interpolate', ['linear'], ['zoom'], 8, 13, 15, 50],
                    'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.4, 15, 1.7],
                    'text-offset': [0, -1.8],
                    'icon-anchor': 'bottom',
                    'text-anchor': 'bottom',
                },
                paint: {
                    'text-color': '#000000',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 1,
                    'text-opacity': 1.0,
                    'icon-opacity': 1.0,
                }
            });
        }
    });
}

export function highLightLabel(map: MapboxMap, id: string, name?: string) {
    if (!map.getLayer(id)) return;
    if (!name) {
        map.setLayoutProperty(id, 'icon-image', 'pin_label_dark');
        return;
    }
    map.setLayoutProperty(id, 'icon-image', [
        'case',
        ['==', ['get', 'fr'], name],
        'pin_label_selected',
        'pin_label_dark'
    ])
}

export function reload_json_labels(map: MapboxMap | null, labels: GeoJsonLabels[]): void {
    if (!map) return;
    labels.forEach((label) => {
        if (map.getLayer(label.id)) map.removeLayer(label.id);
        if (map.getSource(label.id)) map.removeSource(label.id);
    });
    addGeoJsonLabels(map, labels);
}
