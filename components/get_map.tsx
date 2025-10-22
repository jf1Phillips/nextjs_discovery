"use client";

import ZoomInOut from "@/components/zoom_in_out";
import DarkMode from "@/components/darkmode";
import React, { useState,  useRef, useEffect, JSX } from "react";
import mapboxgl, {LngLat, Map as MapboxMap, Marker} from "mapbox-gl";
import Cursor from "./cursor";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";
import set3dTerrain from "./mapbox_functions/set3dterrain";
import addBunker, { removeBunker } from "./mapbox_functions/addBunker";
import addGeoImg, { GeoImg } from "./mapbox_functions/add_geoimg";
import addRoads from "./mapbox_functions/addRoads";
import json_load from "./json_load";
import addRain from "./mapbox_functions/addRain";
import add_popup from "./mapbox_functions/add_popup";
import addGeoJsonLabels, {reload_json_labels, changeLabelsColors} from "./mapbox_functions/geojson_labels";
import get_location from "./mapbox_functions/get_location";

const ROAD_FILENAME: string = "/geoJson_files/route_palestine_merged.geojson";
const LABELS_FILENAME: string = "/geoJson_files/city_label.geojson";
const style: string[] = ["mapbox://styles/mapbox/light-v10", "mapbox://styles/mapbox/dark-v10"];

export {LABELS_FILENAME};


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

const ID_PEF: string = "pef1880map";
const ID_HANS: string = "hans1975map";

const geoImgArray: GeoImg[] = [
    {
        url: "/img/geo_map/pef_1880_map.jpg",
        id: ID_PEF,
        type: "image",
        coord: [
            [34.120542941238725 + 0.008, 33.46703792406347 + 0.003],
            [35.7498100593699 + 0.008, 33.46703792406347 + 0.003],
            [35.7498100593699 + 0.008, 31.10529446421723 - 0.0058],
            [34.120542941238725 + 0.008, 31.10529446421723 - 0.0058],
        ],
    },
    {
        url: "/tiles/{z}/{x}/{y}.webp",
        id: ID_HANS,
        type: "raster",
        opacity: 0.5,
    }
];

const add_all_things = (new_state: MapVar, map: MapboxMap | null, textNbr: number) => {
    if (!map) return;
    addBunker(map);
    json_load("/json_files/test.json", new_state.lang, map, textNbr);
    addGeoImg(map, geoImgArray);
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
        return;
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

    const [displayCursor, setDisplayCursor] = useState<boolean>(true);
    const [locBtn, setLocBtn] = useState<boolean>(false);
    const marker = useRef<Marker | null>(null);
    const whatchId = useRef<number | null>(null);

    return (<>
        <div className={`flex left-0 top-0 absolute z-10
                ${displayCursor ? "flex-col" : "flex-row items-center"}`}>
            <div className={`flex flex-col justify-between p-[5px] duration-300
                    rounded-br-[5px] whitespace-nowrap overflow-hidden
                    ${displayCursor ? "h-[200px] w-[400px]" : "h-[30px] w-[30px]"}
                    ${state.enabled ? "bg-whiteMode" : "bg-darkMode" }`}>
                <div className="flex justify-start">
                    <button className={`text-[15px] duration-300 w-[20px] h-[20px] flex items-center justify-center rounded-[5px]
                        ${!state.enabled ? "text-darkMode bg-whiteMode" : "text-whiteMode bg-darkMode"}
                    `} onClick={() => setDisplayCursor(!displayCursor)}>
                        {displayCursor ? "x" : "☰"}
                    </button>
                </div>
                <Cursor className={!displayCursor ? "hidden": "ml-[5px]"}
                    name="Afficher la carte du PEF (1880)" include={ID_PEF}
                    map={map} enabled={state.enabled} />
                <Cursor className={!displayCursor ? "hidden": "ml-[5px]"}
                    name="Afficher la carte de Hans J. Hopfen (1975)" include={ID_HANS}
                    map={map} enabled={state.enabled} def={50}/>
                <Cursor className={!displayCursor ? "hidden": "ml-[5px]"}
                    name="Afficher les routes de Hans J. Hopfen (1975)" include={ROAD_FILENAME}
                    map={map} enabled={state.enabled} def={100} />
                <Cursor className={!displayCursor ? "hidden": "ml-[5px]"}
                    name="Afficher les lieux" include="city"
                    map={map} enabled={state.enabled} def={100} />
                <Cursor className={!displayCursor ? "hidden": "ml-[5px]"}
                    name="Afficher les routes et bâtiments actuels" include={[
                        "road",
                        "road-label", "waterway-label", "natural-line-label", "natural-point-label", "water-line-label", "water-point-label", "poi-label", "airport-label", "settlement-subdivision-label", "settlement-label",
                        "building", "bridge", "tunnel", "land", "waterway", "park"]}
                    map={map} enabled={state.enabled} def={100}/>
                <Cursor className={!displayCursor ? "hidden" : "ml-[5px]"}
                    name="Afficher les frontières actuelles" include={["admin", "state-label", "country-label"]}
                    map={map} enabled={state.enabled} def={100}/>
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
                        onClick={() => reload_json_labels(map.current, state.lang, "/geoJson_files/city_label.geojson")}
                        >↻</button>
                <button onClick={() => get_location(map.current, marker, !locBtn, setLocBtn, whatchId)}
                            className={`w-[22px] h-[22px] rounded-[2px] duration-300 text-[15px]
                            ${!state.enabled ? `${locBtn ? "text-whiteMode" : "text-[#ff0000]"} bg-darkMode` : "bg-whiteMode text-darkMode"}`}
                        >⊕</button>
            </div>
        </div>
        <div className="relative overflow-hidden">
            <div className={`absolute text-[15px] p-[5px] right-[0px] rounded-bl-[8px] z-10 duration-300 tracking-[1px] top-0
                ${!state.enabled ? "text-whiteMode bg-darkMode" : "text-darkMode bg-whiteMode"}
                ${displayCursor && "hidden"}`}>
                <p>Lng: {lastPos ? lastPos.lng.toFixed(2) : ''}<br/>Lat: {lastPos ? lastPos.lat.toFixed(2) : ''}</p>
            </div>
            <div
                className="overflow-hidden"
                ref={container}
                style={{ width: "100%", height: "100vh" }}/>
        </div>
    </>)
}
