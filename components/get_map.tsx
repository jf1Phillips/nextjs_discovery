"use client";

import ZoomInOut from "@/components/zoom_in_out";
import DarkMode from "@/components/darkmode";
import React, { useState, useRef, useEffect, JSX } from "react";
import mapboxgl, {LngLat, LngLatLike, Map as MapboxMap} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";
import set3dTerrain from "./mapbox_functions/set3dterrain";
import addBunker, { removeBunker } from "./mapbox_functions/addBunker";
import addGeoImg, { addRoads, Coords } from "./mapbox_functions/add_geoimg";
import json_load from "./json_load";
import addRain from "./mapbox_functions/addRain";
import add_popup from "./mapbox_functions/add_popup";

const GEOMAP_FOLDER: string = "/img/geo_map";
const GEOMAP_NAME: string = "geo_map_";
const NEWMAP_NAME: string = "new_map.jpg";
const ROAD_FILENAME: string = "/geoJson_files/route_palestine_merged.geojson";
const LABELS_FILENAME: string = "/geoJson_files/city_label.geojson";
const PINLABEL_FILENAME_DARK: string = "/img/pin_labels_dark.png";
const PINLABEL_FILENAME_WHITE: string = "/img/pin_labels_white.png";
export {GEOMAP_FOLDER, GEOMAP_NAME, LABELS_FILENAME};

function changeLabelsColors(map: MapboxMap, darkmode: boolean, file: string): void
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

function addGeoJsonLabels(file: string, map: MapboxMap, lang ?: string): void
{
    const langage: string = lang ? lang : "fr";
    const id: string = file.replace(/(label|road|geo_map)/gi, "rp");

    if (!map.hasImage('pin_label_dark')) {
        map.loadImage(PINLABEL_FILENAME_DARK, (error, image) => {
            if (error || !image) return;
            if (!map.hasImage('pin_label_dark'))
                map.addImage('pin_label_dark', image);
        });
    }
    if (!map.hasImage('pin_label_white')) {
        map.loadImage(PINLABEL_FILENAME_WHITE, (error, image) => {
            if (error || !image) return;
            if (!map.hasImage('pin_label_white'))
                map.addImage('pin_label_white', image);
        });
    }
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
                'text-halo-width': 1
            }
        });
    }
}

function reload_json_labels(map: MapboxMap, lang: string, file: string): void
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

interface ArgsCursor {
    sliderValue: number,
    setSliderValue: React.Dispatch<React.SetStateAction<number>>,
    name: string,
    include: string,
    map: MapboxMap | null,
    enabled?: boolean,
};

function Cursor({sliderValue, setSliderValue, name, include, map, enabled} : ArgsCursor): JSX.Element {
    const changeOpacity = (value: number) => {
        setSliderValue(value);
        if (!map) return;
        const layers = map.getStyle()?.layers || [];
        layers.forEach(layer => {
            if (layer.id.includes(include)) {
                try {map!.setPaintProperty(layer.id, "text-opacity", value / 100.0);} catch (e) {e;}
                try {map!.setPaintProperty(layer.id, "icon-opacity", value / 100.0);} catch (e) {e;}
                try {map!.setPaintProperty(layer.id, "raster-opacity", value / 100.0);} catch (e) {e;}
                try {map!.setPaintProperty(layer.id, 'line-opacity', value / 100.0);} catch (e) {e;}
            }
        });
    };

    return (<>
        <div className={`relative h-[22px] flex items-center text-[13px] duration-300
            ${!enabled ? "text-whiteMode" : "text-darkMode"}`}>
        <input type="range" min={0} max={100} value={sliderValue} onChange={e => changeOpacity(Number(e.target.value))}
            className={`w-[62px] h-[10px] rounded-lg appearance-none cursor-pointer duration-300
            ${!enabled ? "bg-whiteMode accent-darkMode" : "bg-darkMode accent-whiteMode"}`}
        />
        <p className="ml-[10px] w-[30px]">{sliderValue}</p>
        <p>{name}</p>
    </div>
    </>);
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapVar = {
    zoom: number;
    long: number;
    lat: number;
    style_nbr: number;
    enabled: boolean;
    lang: string;
    relief: boolean;
    rain: boolean;
};

const DEFAULT_VALUE: MapVar = {
    zoom: 8,
    long: 35.47679,
    lat: 32.38416,
    style_nbr: 0,
    enabled: false,
    lang: "fr",
    relief: false,
    rain: false,
};

interface MapArgs {
    def_zoom: number,
    enbl: boolean,
    setEnbl: React.Dispatch<React.SetStateAction<boolean>>,
    textNbr: number,
    histdate: number
};

export default function GetMapboxMap ({def_zoom, enbl, setEnbl, textNbr, histdate}: MapArgs): JSX.Element
{
    const [state, setState] = useState<MapVar>(({...DEFAULT_VALUE, zoom: def_zoom}));
    const [prevNbr, setPrevNbr] = useState<number>(1);
    const [prevHistdate, setPrevHistdate] = useState<number>(histdate);
    const [lastPos, setLastPos] = useState<LngLat | null>(null);
    const map = useRef<MapboxMap | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const style: string[] = ["mapbox://styles/mapbox/light-v10", "mapbox://styles/mapbox/dark-v10"];
    const coord_new_map: Coords = [
        [34.120542941238725, 33.46703792406347],
        [35.7498100593699, 33.46703792406347],
        [35.7498100593699, 31.10529446421723],
        [34.120542941238725, 31.10529446421723],
    ];

    const add_all_things = (new_state: MapVar) => {
        if (!map.current) return;
        addBunker(map.current);
        json_load("/json_files/test.json", new_state.lang, map.current, textNbr);
        addGeoImg(`${GEOMAP_FOLDER}/${GEOMAP_NAME}${new_state.lang}.jpg`, map.current);
        addGeoImg(`${GEOMAP_FOLDER}/${NEWMAP_NAME}`, map.current, coord_new_map);
        addRoads(ROAD_FILENAME, map.current);
        map.current?.setPaintProperty('water', 'fill-color', new_state.enabled ? 'rgba(14, 15, 99, 1)': 'rgba(14, 122, 155, 1)');
        set3dTerrain(map.current, !state.relief);
        addRain(map.current, !state.rain);
        addGeoJsonLabels(LABELS_FILENAME, map.current, new_state.lang);
        changeLabelsColors(map.current, new_state.enabled, LABELS_FILENAME);
    }

    const cpy_txt = async (txt: string): Promise<void> => {
        if (!navigator.clipboard) {
            console.error("Clipboard API not supported");
            return;
        }
        try {await navigator.clipboard.writeText(txt);
        } catch (err) {console.error("Failed to copy text: ", err);}
    }

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: container.current as HTMLDivElement,
                style: style[state.style_nbr],
                projection: 'globe',
                zoom: state.zoom,
                center: [state.long, state.lat],
            });
            map.current.once("style.load", () => add_all_things(state));
            map.current.on("click", (e) => {
                const txt = `${e.lngLat.lng.toFixed(5)},${e.lngLat.lat.toFixed(5)}`;
                cpy_txt(txt);
                setLastPos(e.lngLat);
            });
            add_popup(map.current);
        }
        return () => {map.current?.remove()};
    }, []);

    if (prevNbr != textNbr && map.current) {
        setPrevNbr(textNbr);
        json_load("/json_files/test.json", state.lang, map.current, textNbr, true);
    }

    if (prevHistdate != histdate && map.current) {
        setPrevHistdate(histdate);
        if (histdate > 1955) {
            removeBunker(map.current);
        } else {
            addBunker(map.current);
        }
    }

    const changeMode = () => {
        setEnbl(!enbl);
        setState(prev => {
            const new_state: MapVar = {
                ...prev,
                style_nbr: (prev.style_nbr + 1) % style.length,
                enabled: !prev.enabled,
            };
            map.current?.setStyle(style[new_state.style_nbr]);
            map.current?.once("style.load", () => add_all_things(new_state));
            return new_state;
        });
    }

    const zoomInOut = (z: "in" | "out") => {
        map.current?.easeTo({
            zoom: map.current.getZoom() + (z == "in" ? 1 : -1),
            duration: 300,
        });
    };

    const setRelief = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        set3dTerrain(map.current, state.relief);
        setState(prev => ({...prev, relief: !prev.relief}));
    };

    const setRain = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        addRain(map.current, state.rain);
        setState(prev => ({...prev, rain: !prev.rain}));
    }
    const [sliderValue, setSliderValue] = useState(50);
    const [sliderValue2, setSliderValue2] = useState(100);
    const [sliderValueRoads, setSliderValueRoads] = useState(100);
    const [sliderValueImg2, setSliderValueImg2] = useState(0);

    return (<>
        <div className="w-full flex absolute z-10">
            <div className={`absolute h-[110px] flex flex-col justify-between p-[5px] duration-300 rounded-br-[5px]
                ${state.enabled ? "bg-whiteMode" : "bg-darkMode" }`}>
                <Cursor name="Masquer la carte de Valtorta" include={`${state.lang}.jpg`}
                    sliderValue={sliderValue} setSliderValue={setSliderValue}
                    map={map.current} enabled={state.enabled} />
                <Cursor name="Masquer la carte du PEF de 1880" include={NEWMAP_NAME}
                    sliderValue={sliderValueImg2} setSliderValue={setSliderValueImg2}
                    map={map.current} enabled={state.enabled} />
                <Cursor name="Masquer les marqueurs et les labels" include="city"
                    sliderValue={sliderValue2} setSliderValue={setSliderValue2}
                    map={map.current} enabled={state.enabled} />
                <Cursor name="Masquer routes" include={ROAD_FILENAME}
                    sliderValue={sliderValueRoads} setSliderValue={setSliderValueRoads}
                    map={map.current} enabled={state.enabled} />
            </div>

            <button className={`absolute w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px] top-[120px] left-[150px]
                        ${!state.enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                    onClick={setRelief}>
                        {state.relief ? "2d" : "3d"}</button>
            <button className={`absolute w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px] top-[120px] left-[180px]
                        ${!state.enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                    onClick={setRain}>
                        {!state.rain ? "🌧️" : "☀️"}</button>
            <button className={`absolute w-[22px] h-[22px] rounded-[2px] top-[120px] left-[210px]  duration-300
                        ${!state.enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                    onClick={() => reload_json_labels(map.current as MapboxMap, state.lang, "/geoJson_files/city_label.geojson")}
                    >↻</button>

            <ZoomInOut enabled={state.enabled} setZoom={zoomInOut} />
            <DarkMode enabled={state.enabled} changeMode={changeMode}/>
        </div>
        <div className="relative overflow-hidden">
            <div className={`absolute text-[15px] p-[5px] right-[0px] rounded-bl-[8px] z-10 duration-300 tracking-[1px] top-0
                ${!state.enabled ? "text-whiteMode bg-darkMode" : "text-darkMode bg-whiteMode"}`}>
                <p>Lng: {lastPos ? lastPos.lng.toFixed(2) : ''}<br/>Lat: {lastPos ? lastPos.lat.toFixed(2) : ''}</p>
            </div>
            <div
                className="overflow-hidden"
                ref={container}
                style={{ width: "100%", height: "100vh" }}/>
        </div>
    </>)
}
