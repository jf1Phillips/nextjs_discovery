"use client";

import "@/styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useState, useRef, useEffect, JSX } from "react";
import mapboxgl, { LngLat, Map as MapboxMap, Marker } from "mapbox-gl";
import { Cursor } from "./cursor";
import addBunker, { removeBunker } from "./addBunker";
import json_load from "./json_load";
import SearchBar from "./search_bar";
import mapboxTools, { GeoImg, GeoJsonLabels, LocType } from "@/script/mapbox_functions";
import Toggle from "./toggle";

const ROAD_FILENAME: string = "/geoJson_files/route_palestine_merged.geojson";
const LABELS_FILENAME: string = "/geoJson_files/city_label.geojson";
const style: string = "mapbox://styles/mapbox/light-v10";


export { LABELS_FILENAME };

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapVar = {
    zoom: number,
    long: number,
    lat: number,
    enabled: boolean,
    relief: boolean,
    satellite: boolean,
};

const DEFAULT_VALUE: MapVar = {
    zoom: 8,
    long: 35.47679,
    lat: 32.38416,
    enabled: false,
    relief: false,
    satellite: false,
};

const ID_PEF: string = "pef1880map";
const ID_HANS: string = "hans1975map";

const geoImgArray: GeoImg[] = [
    {
        url: "/img/geo_map/pef_1880_map.webp",
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
    mapboxTools.addGeoImg(map, geoImgArray);
    mapboxTools.addRoads(ROAD_FILENAME, map);
    mapboxTools.set3dTerrain(map, !new_state.relief);
    mapboxTools.setEnvironment(map, null);
    mapboxTools.addGeoJsonLabels(map, LabelsToAdd);
    mapboxTools.setDarkmodeToLabels(map, LabelsToAdd);
    mapboxTools.add_popup(map, LabelsToAdd);
    mapboxTools.setDarkModeToMap(map);
}

interface MapArgs {
    def_zoom: number,
    textNbr: number,
    histdate: number,
    setDarkMode: (val: boolean) => void,
};

export default function GetMapboxMap({ def_zoom, textNbr, histdate, setDarkMode }: MapArgs): JSX.Element {
    const [state, setState] = useState<MapVar>(({ ...DEFAULT_VALUE, zoom: def_zoom }));
    const [lastPos, setLastPos] = useState<LngLat | null>(null);
    const map = useRef<MapboxMap | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const [styleLoaded, setStyleLoaded] = useState<boolean>(false);

    const cpy_txt = async (txt: string): Promise<void> => {
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
            mapboxTools.darkmode = false;
            const scaleControl: mapboxgl.ScaleControl =
                new mapboxgl.ScaleControl({
                    maxWidth: 100,
                    unit: 'metric'
                });
            map.current.addControl(scaleControl);
            map.current.once("style.load", () => {
                add_all_things(state, map.current);
                const waitLoadStyle = (labels: GeoJsonLabels[]) => {
                    if (!map.current) return;
                    const allLoaded = labels.every(label =>
                        map.current?.getLayer(label.id) &&
                        map.current?.getLayer(`${label.id}-highlighted`)
                    );
                    if (allLoaded) {
                        setStyleLoaded(true);
                    } else {
                        setTimeout(() => waitLoadStyle(labels), 100);
                    }
                };
                waitLoadStyle(LabelsToAdd);
            });
            map.current.on("click", (e) => {
                const txt = `${e.lngLat.lng.toFixed(7)},${e.lngLat.lat.toFixed(7)}`;
                cpy_txt(txt);
                setLastPos(e.lngLat);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reloadRef = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        if (!reloadRef.current) return;
        const scaleEl = document.querySelector(".mapboxgl-ctrl-scale");
        const btnsContainer = document.querySelector(".scaleDiv");

        if (scaleEl && btnsContainer) {
            btnsContainer.appendChild(scaleEl);
        }
    }, []);

    useEffect(() => {
        if (!map.current || !styleLoaded) return;
        const modulo = textNbr % 5;
        // mapboxTools.setEnvironment(map.current, {
        //     night: modulo == 0 || state.enabled,
        // });
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
        const new_state: MapVar = { ...state, enabled: !state.enabled };
        setDarkMode(new_state.enabled);
        mapboxTools.darkmode = new_state.enabled;
        mapboxTools.setDarkModeToMap(map.current);
        setState(new_state);
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

    const setSatellite = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        mapboxTools.setSatelliteView(map.current, state.satellite);
        setState(prev => ({...prev, satellite: !prev.satellite}));
    };

    const [displayCursor, setDisplayCursor] = useState<boolean>(true);
    const [locBtn, setLocBtn] = useState<LocType>({ enabled: false, pos: { lng: 0, lat: 0 } });
    const marker = useRef<Marker | null>(null);
    const whatchId = useRef<number | null>(null);

    const goToLoc = () => {
        if (!map.current || !locBtn.enabled) return;
        map.current.flyTo({ center: locBtn.pos });
    }

    const toggleClick = (txt: string, isChecked: boolean) => {
        if (!map.current) return;
        if (!isChecked) {
            mapboxTools.filterGestion(map.current, ID_CITY, `toggle${txt}`, ["!=", ["get", "testament"], txt]);
            mapboxTools.filterGestion(map.current, ID_MARIALCITY, `toggle${txt}`, ["!=", ["get", "testament"], txt]);
        } else {
            mapboxTools.filterGestion(map.current, ID_CITY, `toggle${txt}`, null);
            mapboxTools.filterGestion(map.current, ID_MARIALCITY, `toggle${txt}`, null);
        }
    };

    return (<>
        <div className="flex flex-col left-0 top-0 absolute z-10 pointer-events-none">
            <div className={`flex ${displayCursor ? "flex-col" : "flex-row items-center"}`}>
                <div className={`flex flex-col justify-between p-[10px] duration-300
                        rounded-br-[5px] whitespace-nowrap overflow-hidden pointer-events-auto
                        ${displayCursor ? "h-[280px] w-[400px]" : "h-[30px] w-[30px]"}
                        ${!state.enabled ? "bg-bgDarkMode" : "bg-darkMode"}`}>
                    {/* CLOSE BTN */}
                    <div className="flex justify-start m-[-5px]">
                        <button className={`text-[15px] duration-300 w-[20px] h-[20px] flex items-center justify-center rounded-[5px]
                            ${!state.enabled ? "text-whiteMode bg-bgWhiteMode" : "text-darkMode bg-bgDarkMode"}
                        `} onClick={() => setDisplayCursor(!displayCursor)}>
                            {displayCursor ? "x" : "☰"}
                        </button>
                    </div>
                    {/* ********** */}
                    {
                        styleLoaded && (<>
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
                                name="Afficher les infrastructures actuelles" include={[
                                    "road", "natural-line-label", "natural-point-label", "aeroway",
                                    "water-line-label", "water-point-label", "poi-label", "airport-label",
                                    "settlement-subdivision-label", "settlement-label", "admin", "state-label", "country-label",
                                    "building", "bridge", "tunnel", "waterway", "park", "land-structure-polygon"]}
                                map={map} enabled={state.enabled} def={0} />

                            {/* GEOLOC */}
                            <div className={!displayCursor ? "hidden" : "space-x-4 flex items-center"}>
                                <div className={`flex cursor-pointer rounded-full duration-300 w-11 h-5 items-center
                                        ${!state.enabled ? "bg-whiteMode text-darkMode" : "bg-bgWhiteMode text-whiteMode"}`}
                                    onClick={() => mapboxTools.get_location(map.current, marker, ({ ...locBtn, enabled: !locBtn.enabled }), setLocBtn, whatchId)}>
                                    <p className={`pointer-events-none text-4 select-none duration-300
                                        ${!locBtn.enabled ? "translate-x-2 text-[#ff0000]" : "translate-x-6"}`}>
                                        ⊕</p>
                                </div>
                                <p className={`duration-300 text-[13px] pl-[5px] pr-[5px] rounded-[5px] ${locBtn.enabled && "cursor-pointer"}
                                    ${locBtn.enabled ? (!state.enabled ? "bg-bgWhiteMode text-whiteMode" : "bg-bgDarkMode text-darkMode") :
                                        (!state.enabled ? "text-darkMode" : "text-whiteMode")}`}
                                    onClick={goToLoc}>
                                    Géolocalisation</p>
                            </div>
                            {/* ********** */}
                            <div className={`${!displayCursor ? "hidden" :
                                "flex w-full pr-10 justify-between"}`}>
                                <Toggle defaultChecked={true} text="AT" darkmode={state.enabled} onClick={toggleClick} />
                                <Toggle defaultChecked={true} text="NT" darkmode={state.enabled} onClick={toggleClick} />
                                <Toggle defaultChecked={true} text="EC" darkmode={state.enabled} onClick={toggleClick} />
                            </div>
                            {/* GEOLOC */}
                            <SearchBar className={!displayCursor ? "hidden" : ""}
                                setLastPos={setLastPos as (lngLat: { lng: number; lat: number }) => void}
                                map={map.current as MapboxMap} enabled={state.enabled} />
                            {/* ********** */}
                        </>)}
                </div>
                <div className={`flex space-x-[10px] ml-[10px] ${displayCursor ? "mt-[10px] mb-[10px]" : ""}`}>
                    {/* DARKMODE */}
                    <div className={`pointer-events-auto  flex cursor-pointer rounded-full duration-300 w-[60px]
                            ${state.enabled ? "bg-darkMode" : "bg-bgDarkMode"}`} onClick={changeMode}>
                        <p className={`pointer-events-none text-[15px] select-none duration-300
                            z-10 ml-[5px] mr-[5px]
                            ${state.enabled ? "translate-x-0" : "translate-x-[30px]"}`}>
                            {state.enabled ? "🌑" : "🔆"}</p>
                    </div>
                    {/* ********** */}
                    {/* ZOOM IN OUT */}
                    <div className={`pointer-events-auto w-[55px] h-[22px] text-[20px] flex flex-row justify-between
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
                    <button className={`pointer-events-auto w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px]
                                ${!state.enabled ? "bg-bgDarkMode text-darkModde" : "bg-darkMode text-whiteMode"}`}
                        onClick={setRelief}>
                        {state.relief ? "2d" : "3d"}</button>
                    {/* ********** */}
                    {/* RELOAD JSON */}
                    <button ref={reloadRef}
                        className={`pointer-events-auto w-[22px] h-[22px] rounded-[2px] duration-300 text-[15px] reload_json
                                ${!state.enabled ? "bg-bgDarkMode text-darkMode" : "bg-darkMode text-whiteMode"}`}
                        onClick={() => mapboxTools.reload_json_labels(map.current, LabelsToAdd)}
                    >↻</button>
                    {/* ********** */}
                    {/* SATELLITE */}
                    <button className={`pointer-events-auto w-[22px] h-[22px] duration-300 text-[15px] rounded-[2px]
                                ${!state.enabled ? "bg-bgDarkMode text-darkModde" : "bg-darkMode text-whiteMode"}`}
                        onClick={setSatellite}>
                        {state.satellite ? "◈" : "⊞"}</button>
                    {/* ********** */}
                </div>
            </div>
            {/* LONG LAT */}
            <div className={`w-fit text-[15px] p-[5px] duration-300 tracking-[1px] rounded-br-[5px] pointer-events-none
                ${!state.enabled ? "text-darkMode bg-bgDarkMode" : "bg-darkMode text-whiteMode"}`}>
                <p className="pointer-events-auto">Lng: {lastPos ? lastPos.lng.toFixed(7) : ''}<br />Lat: {lastPos ? lastPos.lat.toFixed(7) : ''}</p>
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
