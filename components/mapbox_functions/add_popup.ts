import mapboxgl, { Map as Mapboxgl, LngLatLike, MapMouseEvent } from "mapbox-gl";
import ReactDOMServer from 'react-dom/server';
import JSXLabels, {DicoJsx} from "../jsxdico";
import { highLightLabel, GeoJsonLabels } from "./geojson_labels";

const labelHandlers = new Map<string, (e: MapMouseEvent) => void>();

/**
 * Handles the click event for a specific label layer, highlighting the label and
 * displaying an interactive popup with optional JSX content.
 *
 * @param map - The Mapbox map instance.
 * @param e - The Mapbox mouse event triggered by a user click.
 * @param label - The specific {@link GeoJsonLabels} entry that was clicked.
 * @param darkmode - Whether the map is currently in dark mode (affects highlight colors and icons).
 *
 * @internal
 * This function is meant to be used internally by {@link add_popup}.
 */
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
    // Reset highlight when popup closes
    popup.once('close', () => highLightLabel(map, [label], darkmode));
    // Hide the popup anchor triangle
    popup.once("open", () => {
            const popup_anchor = document.querySelector('.mapboxgl-popup-tip') as HTMLDivElement;
            popup_anchor.style.display = "none";
    });
    popup.addTo(map);
}


/**
 * Attaches interactive popups to each GeoJSON label layer on the map.
 *
 * When a user clicks on a label, this function:
 * 1. Highlights the clicked label using {@link highLightLabel}.
 * 2. Displays a styled popup showing either basic text or a rendered JSX component.
 * 3. Automatically resets the label’s highlight when the popup closes.
 *
 * Each label layer is assigned its own click handler, which is safely replaced
 * if one already exists — preventing duplicate event bindings.
 *
 * @param map - The Mapbox map instance.
 * @param labels - An array of {@link GeoJsonLabels} representing the label layers to attach popups to.
 * @param darkmode - Whether the map is currently in dark mode (affects colors and icons).
 *
 * @example
 * // Add popups to all label layers
 * add_popup(map, labels, true);
 *
 * @remarks
 * - Popups are dynamically styled with Tailwind-like utility classes for layout and colors.
 * - If a JSX component is associated with a label (`JSXLabels`), it is rendered to HTML using ReactDOMServer.
 * - The label highlight resets when the popup is closed.
 */
function add_popup(map: Mapboxgl, labels: GeoJsonLabels[], darkmode: boolean): void
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
export default add_popup;
