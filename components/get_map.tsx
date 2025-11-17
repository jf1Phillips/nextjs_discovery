"use client";

import "@/styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useState, useRef, useEffect, JSX } from "react";
import mapboxgl, { LngLat, Map as MapboxMap, Marker } from "mapbox-gl";
import { Cursor } from "./cursor";
import addBunker, { removeBunker } from "./addBunker";
import json_load from "./json_load";
import mapboxTools, { GeoImg, GeoJsonLabels } from "@/script/mapbox_functions";

const ROAD_FILENAME: string = "/geoJson_files/route_palestine_merged.geojson";
const LABELS_FILENAME: string = "/geoJson_files/city_label.geojson";
const style: string = "mapbox://styles/mapbox/dark-v10";

export { LABELS_FILENAME };

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapVar = {
    zoom: number;
    long: number;
    lat: number;
    enabled: boolean;
    relief: boolean;
    rain: boolean;
};

const DEFAULT_VALUE: MapVar = {
    zoom: 8,
    long: 35.47679,
    lat: 32.38416,
    enabled: false,
    relief: false,
    rain: false,
};

interface MapArgs {
    def_zoom: number,
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
        opacity: 0,
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
        opacity: 0,
        bounds: [33.6803545, 31.1732927, 36.6260058, 33.7008169],
    }
];

const ID_CITY: string = "cityGeoJson";
const ID_MARIALCITY: string = "marialGeoJson";
const LabelsToAdd: GeoJsonLabels[] = [
    {
        url: "/geoJson_files/city_label.geojson",
        id: ID_CITY,
    },
    {
        url: "/geoJson_files/carte_marial.geojson",
        id: ID_MARIALCITY,
    }
];

const add_all_things = (new_state: MapVar, map: MapboxMap | null) => {
    if (!map) return;
    mapboxTools.darkmode = new_state.enabled;
    mapboxTools.addGeoImg(map, geoImgArray);
    mapboxTools.addRoads(ROAD_FILENAME, map);
    mapboxTools.set3dTerrain(map, !new_state.relief);
    mapboxTools.addRain(map, !new_state.rain);
    mapboxTools.addGeoJsonLabels(map, LabelsToAdd);
    mapboxTools.setDarkmodeToLabels(map, LabelsToAdd);
    mapboxTools.add_popup(map, LabelsToAdd);
    mapboxTools.setDarkModeToMap(map);
}

export default function GetMapboxMap({ def_zoom, setEnbl, textNbr, histdate }: MapArgs): JSX.Element {
    const [state, setState] = useState<MapVar>(({ ...DEFAULT_VALUE, zoom: def_zoom }));
    const [lastPos, setLastPos] = useState<LngLat | null>(null);
    const map = useRef<MapboxMap | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const [styleLoaded, setStyleLoaded] = useState<boolean>(false);

    const cpy_txt = async (txt: string): Promise<void> => {
        return;
        if (!navigator.clipboard) {
            console.error("Clipboard API not supported");
            return;
        }
        try {
            await navigator.clipboard.writeText(txt);
        } catch (err) { console.error("Failed to copy text: ", err); }
    }

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: container.current as HTMLDivElement,
                style: style,
                projection: 'globe',
                zoom: state.zoom,
                center: [state.long, state.lat],
            });
            mapboxTools.darkmode = true;
            map.current.once("style.load", () => {
                add_all_things(state, map.current);
                setStyleLoaded(true);
            });
            map.current.on("click", (e) => {
                const txt = `${e.lngLat.lng.toFixed(5)},${e.lngLat.lat.toFixed(5)}`;
                cpy_txt(txt);
                setLastPos(e.lngLat);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map.current || !styleLoaded) return;
        if (!(textNbr % 4)) {
            mapboxTools.addRain(map.current);
            setState(prev => ({...prev, rain: true}));
        } else {
            mapboxTools.addRain(map.current, true);
            setState(prev => ({...prev, rain: false}));
        }
        json_load(map.current, {
            label: LabelsToAdd[0],
            zoom_level: 10,
            move: true,
            draw_circle: false,
            index: textNbr,
        });
    }, [textNbr, styleLoaded]);

    useEffect(() => {
        if (!map.current || !styleLoaded) return;
        if (histdate > 1955) {
            removeBunker(map.current);
        } else {
            addBunker(map.current);
        }
    }, [histdate, styleLoaded]);

    const changeMode = () => {
        if (!map.current || !styleLoaded) return;
        const new_state: MapVar = {...state, enabled: !state.enabled};
        mapboxTools.darkmode = new_state.enabled;
        mapboxTools.setDarkmodeToLabels(map.current, LabelsToAdd);
        mapboxTools.setDarkModeToMap(map.current);
        setState(new_state);
        setEnbl(new_state.enabled);
    }

    const zoomInOut = (z: "in" | "out") => {
        map.current?.easeTo({
            zoom: map.current.getZoom() + (z == "in" ? 1 : -1),
            duration: 300,
        });
    };

    const setRelief = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        mapboxTools.set3dTerrain(map.current, state.relief);
        setState(prev => ({ ...prev, relief: !prev.relief }));
    };

    const setRain = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        mapboxTools.addRain(map.current, state.rain);
        setState(prev => ({ ...prev, rain: !prev.rain }));
    }

    const [displayCursor, setDisplayCursor] = useState<boolean>(true);
    const [locBtn, setLocBtn] = useState<boolean>(false);
    const marker = useRef<Marker | null>(null);
    const whatchId = useRef<number | null>(null);

    return (<>
        <div className="flex flex-col left-0 top-0 absolute z-10">
            <div className={`flex ${displayCursor ? "flex-col" : "flex-row items-center"}`}>
                <div className={`flex flex-col justify-between p-[10px] duration-300
                        rounded-br-[5px] whitespace-nowrap overflow-hidden
                        ${displayCursor ? "h-[240px] w-[400px]" : "h-[30px] w-[30px]"}
                        ${!state.enabled ? "bg-bgDarkMode" : "bg-darkMode"}`}>
                    {/* CLOSE BTN */}
                    <div className="flex justify-start m-[-5px]">
                        <button className={`text-[15px] duration-300 w-[20px] h-[20px] flex items-center justify-center rounded-[5px]
                            ${!state.enabled ? "text-darkMode bg-bgWhiteMode" : "text-whiteMode bg-bgDarkMode"}
                        `} onClick={() => setDisplayCursor(!displayCursor)}>
                            {displayCursor ? "x" : "☰"}
                        </button>
                    </div>
                    {/* ********** */}
                    {
                        styleLoaded ? (<>
                            <Cursor className={!displayCursor ? "hidden" : ""}
                                name="Afficher la carte du PEF (1880)" include={ID_PEF}
                                map={map} enabled={state.enabled} />
                            <Cursor className={!displayCursor ? "hidden" : ""}
                                name="Afficher la carte de Hans J. Hopfen (1975)" include={ID_HANS}
                                map={map} enabled={state.enabled} />
                            <Cursor className={!displayCursor ? "hidden" : ""}
                                name="Afficher les routes de Hans J. Hopfen (1975)" include={ROAD_FILENAME}
                                map={map} enabled={state.enabled} def={100} />
                            <Cursor className={!displayCursor ? "hidden" : ""}
                                name="Afficher les lieux" include={ID_CITY}
                                map={map} enabled={state.enabled} def={100} />
                            <Cursor className={!displayCursor ? "hidden" : ""}
                                name="Afficher les routes et bâtiments actuels" include={[
                                    "road", "natural-line-label", "natural-point-label",
                                    "water-line-label", "water-point-label", "poi-label", "airport-label",
                                    "settlement-subdivision-label", "settlement-label",
                                    "building", "bridge", "tunnel", "land", "waterway", "park"]}
                                map={map} enabled={state.enabled} def={0} />
                            <Cursor className={!displayCursor ? "hidden" : ""}
                                name="Afficher les frontières actuelles" include={["admin", "state-label", "country-label"]}
                                map={map} enabled={state.enabled} def={100} />
                        </>) : null
                    }
                    {/* GEOLOC */}
                    <div className={!displayCursor ? "hidden" : "space-x-[15px] flex items-center"}>
                        <div className={`flex cursor-pointer rounded-full duration-300 w-[40px] h-[20px] items-center
                                ${!state.enabled ? "bg-whiteMode text-whiteMode" : "bg-bgWhiteMode text-darkMode"}`}
                            onClick={() => mapboxTools.get_location(map.current, marker, !locBtn, setLocBtn, whatchId)}>
                            <p className={`pointer-events-none text-[15px] select-none duration-300
                                ml-[5px] mr-[5px]
                                ${!locBtn ? "translate-x-[2px] text-[#ff0000]" : "translate-x-[18px]"}`}>
                                ⊕</p>
                        </div>
                        <p className={`duration-300 text-[13px] ${!state.enabled ? "text-darkMode" : "text-whiteMode"}`}>
                            Géolocalisation</p>
                    </div>
                    {/* ********** */}
                </div>
                <div className={`flex space-x-[10px] ml-[10px] ${displayCursor ? "mt-[10px] mb-[10px]" : ""}`}>
                    {/* DARKMODE */}
                    <div className={`flex cursor-pointer rounded-full duration-300 w-[60px]
                            ${state.enabled ? "bg-darkMode" : "bg-bgDarkMode"}`} onClick={changeMode}>
                        <p className={`pointer-events-none text-[15px] select-none duration-300
                            z-10 ml-[5px] mr-[5px]
                            ${state.enabled ? "translate-x-0" : "translate-x-[30px]"}`}>
                            {state.enabled ? "🌑" : "🔆"}</p>
                    </div>
                    {/* ********** */}
                    {/* ZOOM IN OUT */}
                    <div className={`w-[55px] h-[22px] text-[20px] flex flex-row justify-between
                            ${state.enabled ? "text-whiteMode" : "text-darkMode"}`}>
                        <button className={`rounded-[2px] w-[22px] h-[22px] flex items-center justify-center duration-[300ms]
                            ${!state.enabled ? "bg-bgDarkMode" : "bg-darkMode"}`}
                            onClick={() => { zoomInOut("out") }}>-</button>
                        <button className={`rounded-[2px] w-[22px] h-[22px] flex items-center justify-center duration-[300ms]
                            ${!state.enabled ? "bg-bgDarkMode" : "bg-darkMode"}`}
                            onClick={() => { zoomInOut("in") }}>+</button>
                    </div>
                    {/* ********** */}
                    {/* RELIEF */}
                    <button className={`w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px]
                                ${!state.enabled ? "bg-bgDarkMode text-darkModde" : "bg-darkMode text-whiteMode"}`}
                        onClick={setRelief}>
                        {state.relief ? "2d" : "3d"}</button>
                    {/* ********** */}
                    {/* RAIN */}
                    <button className={`w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px]
                                ${!state.enabled ? "bg-bgDarkMode" : "bg-darkMode"}`}
                        onClick={setRain}>
                        {!state.rain ? "🌧️" : "☀️"}</button>
                    {/* ********** */}
                    {/* RELOAD JSON */}
                    <button className={`w-[22px] h-[22px] rounded-[2px] duration-300 text-[15px]
                                ${!state.enabled ? "bg-bgDarkMode text-darkMode" : "bg-darkMode text-whiteMode"}`}
                        onClick={() => mapboxTools.reload_json_labels(map.current, LabelsToAdd)}
                    >↻</button>
                    {/* ********** */}
                </div>
            </div>
            {/* LONG LAT */}
            <div className={`w-fit text-[15px] p-[5px] duration-300 tracking-[1px] rounded-br-[5px]
                ${!state.enabled ? "text-darkMode bg-bgDarkMode" : "bg-darkMode text-whiteMode"}`}>
                <p>Lng: {lastPos ? lastPos.lng.toFixed(2) : ''}<br />Lat: {lastPos ? lastPos.lat.toFixed(2) : ''}</p>
            </div>
            {/* ********** */}
        </div>
        <div className="relative">
            <div
                className="overflow-hidden"
                ref={container}
                style={{ width: "100%", height: "100vh" }} />
        </div>
    </>)
}
