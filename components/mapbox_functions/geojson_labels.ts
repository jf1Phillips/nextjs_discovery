import { Map as MapboxMap } from "mapbox-gl";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
const PINLABEL_FILENAME_DARK: string = "/img/pin_labels_dark.png";
const PINLABEL_FILENAME_WHITE: string = "/img/pin_labels_white.png";
const PINLABEL_FILENAME_ORANGE: string = "/img/pin_labels_orange.png";

export function changeLabelsColors(map: MapboxMap, darkmode: boolean, file: string): void
{
    const id: string = file.replace(/(label|road|geo_map)/gi, "rp");

    if (!map.getLayer(id)) return;
    if (darkmode) {
        map.setPaintProperty(id, 'text-color', '#ffffff');
        map.setPaintProperty(id, 'text-halo-color', '#000000');
        map.setLayoutProperty(id, 'icon-image', 'pin_label_white');
    } else {
        map.setPaintProperty(id, 'text-color', '#000000');
        map.setPaintProperty(id, 'text-halo-color', '#ffffff');
        map.setLayoutProperty(id, 'icon-image', 'pin_label_dark');
    }
}

export default function addGeoJsonLabels(file: string, map: MapboxMap, lang ?: string): void
{
    const langage: string = lang ? lang : "fr";
    const id: string = file.replace(/(label|road|geo_map)/gi, "rp");
    const icons = [
        { name: 'pin_label_dark', url: PINLABEL_FILENAME_DARK },
        { name: 'pin_label_white', url: PINLABEL_FILENAME_WHITE },
        { name: 'pin_label_selected', url: PINLABEL_FILENAME_ORANGE}
    ];

    icons.forEach(({ name, url }) => {
        if (!map.hasImage(name)) {
            map.loadImage(url, (error, image) => {
                if (error || !image) return;
                if (!map.hasImage(name))
                    map.addImage(name, image);
            });
        }
    });
    if (!map.getSource(id)) {
        map.addSource(id, {
            type: 'geojson',
            data: file
        });
    }
    if (!map.getLayer(id)) {
        map.addLayer({
            id: id,
            type: 'symbol',
            source: id,
            layout: {
                'icon-image': 'pin_label_dark',
                'icon-allow-overlap': true,
                'text-field': ['coalesce', ['get', `${langage}`], ['get', 'fr']],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': ['interpolate', ['linear'], ['zoom'],
                    8, 13, 15, 50],
                'icon-size': ['interpolate', ['linear'], ['zoom'],
                    8, 0.4, 15, 1.7],
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
}

export function highLightLabel(map: MapboxMap, id: string, name?: string)
{
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

export function reload_json_labels(map: MapboxMap, lang: string, file: string): void
{
    const id: string = file.replace(/(label|road|geo_map)/gi, "rp");

    if (map.getLayer(id)) {
        map.removeLayer(id);
    }
    if (map.getSource(id)) {
        map.removeSource(id);
    }
    addGeoJsonLabels(file, map, lang);
}
