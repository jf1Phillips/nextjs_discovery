import mapboxgl, {LngLat, Map as MapboxMap} from 'mapbox-gl';
import ReactDOMServer from 'react-dom/server';
import HtmlPopup from '../html_popup';

const markers: mapboxgl.Marker[] = [];
const custom_rm: mapboxgl.Marker[] = [];

export default function add_marker(long: number, lat: number, map: MapboxMap, str: string, rm ?: boolean): void
{
    const popup = new mapboxgl.Popup({offset: 10})
        .setHTML(`<p>${str}</p>`);
    const div_marker: HTMLDivElement = document.createElement('div');
    div_marker.className = "marker mt-[-15px] bg-[url(/img/map_pin.png)] bg-cover w-[30px] h-[30px] cursor-pointer";
    const marker = new mapboxgl.Marker(div_marker).setLngLat([long, lat]).addTo(map);

    marker.setPopup(popup);
    markers.push(marker);
    if (rm)
        custom_rm.push(marker);
}

export function add_bethsaida_marker(map: MapboxMap): void
{
    const html_str: string = ReactDOMServer.renderToString(HtmlPopup());
    const coords: LngLat = new LngLat(35.6305828176177, 32.9111642883132);
    const popup = new mapboxgl.Popup({offset: 10})
        .setHTML(`${html_str}`);
    const div_marker: HTMLDivElement = document.createElement('div');
    div_marker.className = "marker mt-[-15px] bg-[url(/img/map_pin.png)] bg-cover w-[30px] h-[30px] cursor-pointer";

    popup.on('open', () => {
        const popup_el = document.querySelector('.mapboxgl-popup-content') as HTMLDivElement;

        popup_el.classList.add(
            'flex',
            'flex-col',
            'items-center',
            'w-[250px]',
            'h-[300px]',
            'text-white'
        );
        popup_el.style.overflowY = 'scroll';
        popup_el.style.backgroundColor = 'rgb(26, 18, 31)';
        popup_el.style.scrollbarWidth = 'thin';
        popup_el.style.scrollbarColor = '#616161 #2a2a2a';
    });
    const marker = new mapboxgl.Marker(div_marker).setLngLat([coords.lng, coords.lat]).addTo(map);
    marker.setPopup(popup);
    markers.push(marker);
}

export function remove_marker(custom ?: boolean): void
{
    if (custom) {
        custom_rm.forEach(marker => {marker.remove()});
        custom_rm.length = 0;
        return;
    }
    markers.forEach(marker => {marker.remove()});
    markers.length = 0;
}
