import mapboxgl, { Map as Mapboxgl, LngLatLike, MapMouseEvent } from "mapbox-gl";
import ReactDOMServer from 'react-dom/server';
import JSXLabels, {DicoJsx} from "../jsxdico";
import { highLightLabel, GeoJsonLabels } from "./geojson_labels";

const labelHandlers = new Map<string, (e: MapMouseEvent) => void>();

function handler(map: Mapboxgl, e: MapMouseEvent, label: GeoJsonLabels, darkmode: boolean): void {
    if (!e.features || !e.features.length) return;
    const feature = e.features[0];
    if (!feature.properties || feature.geometry.type !== 'Point') return;

    const labelTXT = feature.properties['fr'];
    highLightLabel(map, [label], darkmode, labelTXT);

    // if the label is in the dico
    const dicoEntry: DicoJsx | undefined = JSXLabels.find(e => e.town === labelTXT);

    const coords = feature.geometry.coordinates as LngLatLike;
    const popup = new mapboxgl.Popup({anchor: "bottom", closeButton: false, offset: [0, -30]})
                                .setLngLat(coords);
    if (!dicoEntry) {
        popup.setHTML(`<p style="font-weight:bold;font-size:20px;">${labelTXT}</p>`)
    } else {
        const html_str: string = ReactDOMServer.renderToString(dicoEntry.jsx);
        popup.setHTML(html_str);
        popup.setOffset([-20, -30]);
        popup.once("open", () => {
            const popup_el = document.querySelector('.mapboxgl-popup-content') as HTMLDivElement;

            popup_el.classList.add(
                'flex',
                'flex-col',
                'items-center',
                `w-[280px]`,
                'max-h-[500px]',
                'overflow-y-auto',
                'text-white');
            popup_el.style.backgroundColor = 'rgb(26, 18, 31)';
            popup_el.style.scrollbarWidth = 'thin';
            popup_el.style.scrollbarColor = '#616161 #2a2a2a';
        });
    }
    popup.once('close', () => highLightLabel(map, [label], darkmode));
    popup.once("open", () => {
            const popup_anchor = document.querySelector('.mapboxgl-popup-tip') as HTMLDivElement;
            popup_anchor.style.display = "none";
    });
    popup.addTo(map);
}

export default function add_popup(map: Mapboxgl, labels: GeoJsonLabels[], darkmode: boolean): void
{
    labels.forEach((label) => {
        const oldHandler = labelHandlers.get(label.id);
        if (oldHandler) {
            map.off("click", label.id, oldHandler);
        }
        const newHandler = (e: MapMouseEvent) => handler(map, e, label, darkmode);
        labelHandlers.set(label.id, newHandler);
        map.on("click", label.id, newHandler);
    });
}
