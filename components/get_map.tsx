"use client";

import SelectLang from "@/components/select_option";
import ZoomInOut from "@/components/zoom_in_out";
import DarkMode from "@/components/darkmode";
import React, { useState, useRef, useEffect, JSX } from "react";
import mapboxgl, {LngLat, Map as MapboxMap} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";
import set3dTerrain from "./mapbox_functions/set3dterrain";
import addBunker, { removeBunker } from "./mapbox_functions/addBunker";
import addGeoImg, { addRoads } from "./mapbox_functions/add_geoimg";
import get_loc from "@/script/get_loc";
import atoi from "@/script/atoi";
import json_load from "./json_load";
import addRain from "./mapbox_functions/addRain";
import add_marker, {remove_marker, add_bethsaida_marker} from "./mapbox_functions/add_marker";
import { V4MAPPED } from "dns";

const GEOMAP_FOLDER: string = "/img/geo_map";
const GEOMAP_NAME: string = "geo_map_";
// const ROAD_FILENAME: string = "/test.geojson";
const ROAD_FILENAME: string = "/geoJson_files/route_palestine_merged.geojson";
const LABELS_FILENAME: string = "/geoJson_files/city_label.geojson";
const PINLABEL_FILENAME_DARK: string = "/img/pin_labels_dark.png";
const PINLABEL_FILENAME_WHITE: string = "/img/pin_labels_white.png";
export {GEOMAP_FOLDER, GEOMAP_NAME};

function changeLabelsLang(map: MapboxMap, lang: string, file: string): void
{
    const id: string = file.replace(/(label|road|geo_map)/gi, "rp");

    if (!map.getLayer(id)) return;
    map.setLayoutProperty(id, 'text-field', ['coalesce', ['get', `${lang}`], ['get', 'fr']]);
}

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
            if (error) return;
            if (!image) return;
            if (!map.hasImage('pin_label_dark'))
                map.addImage('pin_label_dark', image);
        }
        );
    }
    if (!map.hasImage('pin_label_white')) {
        map.loadImage(PINLABEL_FILENAME_WHITE, (error, image) => {
            if (error) return;
            if (!image) return;
            if (!map.hasImage('pin_label_white'))
                map.addImage('pin_label_white', image);
        }
        );
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
    zoom: 1,
    long: 2.35522,
    lat: 48.8566,
    // zoom: 12,
    // long: 35,
    // lat: 32.8,
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

    const add_all_things = (new_state: MapVar) => {
        if (!map.current) return;
        remove_marker();
        addBunker(map.current);
        add_marker(2.10, 48.15, map.current, "Personal bunker (disparait apres 1955)");
        add_bethsaida_marker(map.current);
        get_loc().then(location => {
            if (!location || !map.current) return;
            add_marker(location.long, location.lat, map.current, "your location");
        });
        add_marker(DEFAULT_VALUE.long, DEFAULT_VALUE.lat, map.current, "paris");
        json_load("/json_files/test.json", new_state.lang, map.current, textNbr);
        addGeoImg(`${GEOMAP_FOLDER}/${GEOMAP_NAME}${new_state.lang}.png`, map.current);
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
        try {
            await navigator.clipboard.writeText(txt);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
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
        }
        return () => {map.current?.remove()};
    }, []);

    if (prevNbr != textNbr && map.current) {
        setPrevNbr(textNbr);
        console.log("OKOK");
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

    const submitEvent = (event: React.FormEvent) => {
        event.preventDefault();
        const target: HTMLFormElement = event.target as HTMLFormElement;
        const newZoom = atoi(target.zoom.value, DEFAULT_VALUE.zoom);
        const newLat = atoi(target.lat.value, DEFAULT_VALUE.lat);
        const newLong = atoi(target.long.value, DEFAULT_VALUE.long);

        setState(prev => ({
            ...prev,
            zoom: newZoom,
            lat: newLat,
            long: newLong,
        }));
        map.current?.easeTo({
            zoom: newZoom,
            center: [newLong, newLat],
            duration: 1000,
        });
    };

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

    const changeLang = (lang: string) => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        json_load("/json_files/test.json", lang, map.current, textNbr);
        addGeoImg(`${GEOMAP_FOLDER}/${GEOMAP_NAME}${lang}.png`, map.current);
        changeLabelsLang(map.current, lang, LABELS_FILENAME);
        setState(prev => ({
            ...prev,
            lang: lang,
        }));
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

    const changeOpacity = (value: number, include: string, set: React.Dispatch<React.SetStateAction<number>>) => {
        set(value);
        if (!map.current) return;
        const layers = map.current.getStyle()?.layers || [];
        layers.forEach(layer => {
            if (layer.id.includes(include)) {
                try {
                    map.current!.setPaintProperty(layer.id, "text-opacity", value / 100.0);
                } catch (e) {e;}
                try {
                    map.current!.setPaintProperty(layer.id, "icon-opacity", value / 100.0);
                } catch (e) {e;}
                try {
                    map.current!.setPaintProperty(layer.id, "raster-opacity", value / 100.0);
                } catch (e) {e;}
            }
        });
    };

    return (<>
        <div className="w-full h-[120px]">
            <button className={`absolute w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px] top-[80px] left-[10px]
                        ${state.enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                    onClick={setRelief}>
                        {state.relief ? "2d" : "3d"}</button>
            <button className={`absolute w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px] top-[80px] left-[50px]
                        ${state.enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                    onClick={setRain}>
                        {!state.rain ? "🌧️" : "☀️"}</button>

            <div className={`absolute top-[15px] left-[10px] h-[22px] flex items-center text-[13px]
                    ${state.enabled ? "text-whiteMode" : "text-whiteMode"}`}>
                <input type="range" min={0} max={100} value={sliderValue} onChange={e => changeOpacity(Number(e.target.value), "geo_map", setSliderValue)}
                    className={`w-[62px] h-[10px] rounded-lg appearance-none cursor-pointer duration-300
                    ${!state.enabled ? "bg-whiteMode accent-darkMode" : "bg-darkMode accent-whiteMode"}`}
                />
                <p className="ml-[10px] w-[30px]">{sliderValue}</p>
                <p>{"Masquer l'image de fond"}</p>
            </div>
            <div className={`absolute top-[45px] left-[10px] h-[22px] flex items-center text-[13px]
                    ${state.enabled ? "text-whiteMode" : "text-whiteMode"}`}>
                <input type="range" min={0} max={100} value={sliderValue2} onChange={e => changeOpacity(Number(e.target.value), "city", setSliderValue2)}
                    className={`w-[62px] h-[10px] rounded-lg appearance-none cursor-pointer duration-300
                    ${!state.enabled ? "bg-whiteMode accent-darkMode" : "bg-darkMode accent-whiteMode"}`}
                />
                <p className="ml-[10px] w-[30px]">{sliderValue2}</p>
                <p>Masquer les marqueurs et les labels</p>
            </div>

            {/* <button className={`absolute w-[22px] h-[22px] rounded-[2px] mt-[120px] left-[72px]  duration-300
                        ${state.enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                    onClick={() => reload_json_labels(map.current as MapboxMap, state.lang, "/geoJson_files/city_label.geojson")}
                    >↻</button> */}

            {/* <SelectLang setSelected={changeLang} darkmode={state.enabled}/> */}
            <ZoomInOut enabled={state.enabled} setZoom={zoomInOut} />
            <DarkMode enabled={state.enabled} changeMode={changeMode}/>
            {/* <form className="text-customWhite flex flex-col items-center justify-center mt-4"
                    onSubmit={submitEvent}>
                <div className="flex flex-row gap-x-[10vw]">
                    <div className="flex flex-col items-center">
                        <label className="mb-[5px]">Zoom</label>
                        <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                                type="text" name="zoom" defaultValue={state.zoom.toString()}/>
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="mb-[5px]">Lat</label>
                        <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                                type="text" name="lat" defaultValue={state.lat.toString()}/>
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="mb-[5px]">Long</label>
                        <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                                type="text" name="long" defaultValue={state.long.toString()}/>
                    </div>
                </div>
                <button className="
                        rounded-full bg-customGrey2 w-[80px] mt-[30px] h-[30px] border-customGrey2
                        hover:bg-customGrey2Hover hover:border-[2px] hover:border-solid hover:border-customGrey2
                        transition-all duration-200 ease-in-out"
                    type="submit">View</button>
            </form> */}
        </div>
        <div className="relative overflow-hidden">
            <div className={`absolute text-[18px] p-[5px] rounded-br-[8px] z-10 duration-300 tracking-[1px] top-0 left-0
                ${state.enabled ? "text-whiteMode bg-darkMode" : "text-darkMode bg-whiteMode"}`}>
                <p>Lng: {lastPos ? lastPos.lng.toFixed(5) : ''}<br/>Lat: {lastPos ? lastPos.lat.toFixed(5) : ''}</p>
            </div>
            <div
                className="overflow-hidden"
                ref={container}
                style={{ width: "100%", height: "calc(100vh - 120px)" }}/>
        </div>
    </>)
}
