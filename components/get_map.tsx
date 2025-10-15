"use client";

import ZoomInOut from "@/components/zoom_in_out";
import DarkMode from "@/components/darkmode";
import React, { useState,  useRef, useEffect, JSX } from "react";
import mapboxgl, {Layer, LngLat, Map as MapboxMap} from "mapbox-gl";
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
                'text-halo-width': 1,
                'text-opacity': 1.0,
                'icon-opacity': 1.0,
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
    className?: string,
    map: MapboxMap | null,
    enabled?: boolean,
};

function Cursor({sliderValue, setSliderValue, name, include, className, map, enabled} : ArgsCursor): JSX.Element {
    const changeOpacity = (value: number) => {
        setSliderValue(value);
        if (!map) return;
        const layers = map.getStyle()?.layers || [];

        type PaintPropertyName = Parameters<typeof map.setPaintProperty>[1];
        const set_paint_property = (layer: Layer, type: PaintPropertyName) => {
            if (!layer.paint) return;
            if (type in layer.paint)
                map.setPaintProperty(layer.id, type, value / 100.0);
        };
        layers.forEach(layer => {
            if (layer.id.includes(include)) {
                set_paint_property(layer, "raster-opacity");
                set_paint_property(layer, "text-opacity");
                set_paint_property(layer, "icon-opacity");
                set_paint_property(layer, "line-opacity");
            }
        });
    };

    return (<>
    <div className={`relative h-[22px] flex items-center text-[13px] duration-300 space-x-[10px] ${className}
            ${!enabled ? "text-whiteMode" : "text-darkMode"}`}>
        <input type="range" min={0} max={100} value={sliderValue} onChange={e => changeOpacity(Number(e.target.value))}
            className={`w-[62px] h-[10px] rounded-lg appearance-none cursor-pointer duration-300
            ${!enabled ? "bg-whiteMode accent-darkMode" : "bg-darkMode accent-whiteMode"}`}
        />
        <p className="min-w-[20px]">{sliderValue}</p>
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

const style: string[] = ["mapbox://styles/mapbox/light-v10", "mapbox://styles/mapbox/dark-v10"];
const coord_new_map: Coords = [
    [34.120542941238725, 33.46703792406347],
    [35.7498100593699, 33.46703792406347],
    [35.7498100593699, 31.10529446421723],
    [34.120542941238725, 31.10529446421723],
];

const add_all_things = (new_state: MapVar, map: MapboxMap | null, textNbr: number) => {
    if (!map) return;
    addBunker(map);
    json_load("/json_files/test.json", new_state.lang, map, textNbr);
    addGeoImg(`${GEOMAP_FOLDER}/${GEOMAP_NAME}${new_state.lang}.jpg`, map);
    addGeoImg(`${GEOMAP_FOLDER}/${NEWMAP_NAME}`, map, coord_new_map);
    addRoads(ROAD_FILENAME, map);
    map?.setPaintProperty('water', 'fill-color', new_state.enabled ? 'rgba(14, 15, 99, 1)': 'rgba(14, 122, 155, 1)');
    set3dTerrain(map, !new_state.relief);
    addRain(map, !new_state.rain);
    addGeoJsonLabels(LABELS_FILENAME, map, new_state.lang);
    changeLabelsColors(map, new_state.enabled, LABELS_FILENAME);
}

export default function GetMapboxMap ({def_zoom, enbl, setEnbl, textNbr, histdate}: MapArgs): JSX.Element
{
    const [state, setState] = useState<MapVar>(({...DEFAULT_VALUE, zoom: def_zoom}));
    const [prevNbr, setPrevNbr] = useState<number>(1);
    const [prevHistdate, setPrevHistdate] = useState<number>(histdate);
    const [lastPos, setLastPos] = useState<LngLat | null>(null);
    const map = useRef<MapboxMap | null>(null);
    const container = useRef<HTMLDivElement | null>(null);

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
            map.current.once("style.load", () => add_all_things(state, map.current, textNbr));
            map.current.on("click", (e) => {
                const txt = `${e.lngLat.lng.toFixed(5)},${e.lngLat.lat.toFixed(5)}`;
                cpy_txt(txt);
                setLastPos(e.lngLat);
            });
            add_popup(map.current);
        }
    }, [state, textNbr]);

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
            map.current?.once("style.load", () => add_all_things(new_state, map.current, textNbr));
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
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [sliderValue2, setSliderValue2] = useState<number>(100);
    const [sliderValueRoads, setSliderValueRoads] = useState<number>(100);
    const [sliderValueImg2, setSliderValueImg2] = useState<number>(0);

    const [displayCursor, setDisplayCursor] = useState<boolean>(true);
    return (<>
        <div className={`flex left-0 top-0 absolute z-10
                ${displayCursor ? "flex-col" : "flex-row items-center"}`}>
            <div className={`flex flex-col justify-between p-[5px] duration-500 rounded-br-[5px] whitespace-nowrap overflow-hidden
                ${displayCursor ? "h-[180px] w-[400px]" : "h-[30px] w-[30px]"}
                ${state.enabled ? "bg-whiteMode" : "bg-darkMode" }`}>
                <Cursor className={!displayCursor ? "hidden": ""} name="Afficher la carte de Hans J. Hopfen (1975)" include={`${state.lang}.jpg`}
                    sliderValue={sliderValue} setSliderValue={setSliderValue}
                    map={map.current} enabled={state.enabled} />
                <Cursor className={!displayCursor ? "hidden": ""} name="Afficher la carte du PEF de 1880" include={NEWMAP_NAME}
                    sliderValue={sliderValueImg2} setSliderValue={setSliderValueImg2}
                    map={map.current} enabled={state.enabled} />
                <Cursor className={!displayCursor ? "hidden": ""} name="Afficher les marqueurs et les labels" include="city"
                    sliderValue={sliderValue2} setSliderValue={setSliderValue2}
                    map={map.current} enabled={state.enabled} />
                <Cursor className={!displayCursor ? "hidden": ""} name="Afficher les routes de Hans J. Hopfen (1975)" include={ROAD_FILENAME}
                    sliderValue={sliderValueRoads} setSliderValue={setSliderValueRoads}
                    map={map.current} enabled={state.enabled} />
                <div className="flex justify-center">
                    <button className={`text-[15px] duration-300 w-[20px] h-[20px] flex items-center justify-center rounded-[5px]
                        ${!state.enabled ? "text-darkMode bg-whiteMode" : "text-whiteMode bg-darkMode"}
                    `} onClick={() => setDisplayCursor(!displayCursor)}>
                        {displayCursor ? "x" : "☰"}
                    </button>
                </div>
            </div>
            <div className={`flex space-x-[10px] ml-[10px] ${displayCursor ? "mt-[10px]" : ""}`}>
                <DarkMode enabled={state.enabled} changeMode={changeMode}/>
                <ZoomInOut enabled={state.enabled} setZoom={zoomInOut} />
                <button className={`w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px]
                            ${!state.enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                        onClick={setRelief}>
                            {state.relief ? "2d" : "3d"}</button>
                <button className={`w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px]
                            ${!state.enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                        onClick={setRain}>
                            {!state.rain ? "🌧️" : "☀️"}</button>
                <button className={`w-[22px] h-[22px] rounded-[2px] duration-300 text-[15px]
                            ${!state.enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                        onClick={() => reload_json_labels(map.current as MapboxMap, state.lang, "/geoJson_files/city_label.geojson")}
                        >↻</button>
            </div>
        </div>
        <div className="relative overflow-hidden">
            <div className={`absolute text-[15px] p-[5px] right-[0px] rounded-bl-[8px] z-10 duration-300 tracking-[1px] top-0
                ${!state.enabled ? "text-whiteMode bg-darkMode" : "text-darkMode bg-whiteMode"}
                ${displayCursor ? "hidden" : ""}`}>
                <p>Lng: {lastPos ? lastPos.lng.toFixed(2) : ''}<br/>Lat: {lastPos ? lastPos.lat.toFixed(2) : ''}</p>
            </div>
            <div
                className="overflow-hidden"
                ref={container}
                style={{ width: "100%", height: "100vh" }}/>
        </div>
    </>)
}
