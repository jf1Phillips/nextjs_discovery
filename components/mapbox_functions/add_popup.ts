import mapboxgl, { Map as Mapboxgl, LngLatLike } from "mapbox-gl";
import ReactDOMServer from 'react-dom/server';
import { LABELS_FILENAME } from "../get_map";
import JSXLabels, {DicoJsx} from "../jsxdico";
import { highLightLabel } from "./geojson_labels";

export default function add_popup(map: Mapboxgl): void
{
    const id: string = LABELS_FILENAME.replace(/(label|road|geo_map)/gi, "rp");
    map.on("click", id, (e) => {
        if (!e.features || !e.features.length || !map) return;
        const feature = e.features[0];
        if (feature.geometry?.type !== 'Point') return;
        const labelText = feature.properties?.['fr'] || 'Label';
        highLightLabel(map, id, labelText);

        const entry : DicoJsx | undefined = JSXLabels.find(entry => entry.town === labelText);

        const coords = feature.geometry.coordinates as LngLatLike;
        const popup = new mapboxgl.Popup({anchor: "bottom", closeButton: false, offset: [0, -30]})
            .setLngLat(coords);
        if (!entry) {
            popup.setHTML(`<p style="font-weight:bold;font-size:20px;">${labelText}</p>`)
        } else {
            const html_str: string = ReactDOMServer.renderToString(entry.jsx);
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
        popup.once('close', () => highLightLabel(map, id));
        popup.once("open", () => {
                const popup_anchor = document.querySelector('.mapboxgl-popup-tip') as HTMLDivElement;
                popup_anchor.style.display = "none";
        });
        popup.addTo(map);
    });
}
