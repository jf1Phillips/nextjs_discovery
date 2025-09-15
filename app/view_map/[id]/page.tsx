"use client";

import React, { useRef, use, useState } from "react";
import MapDisplay from "@/component/map";
import "@/styles/globals.css";
import DarkMode from "@/component/darkmode";
import atoi from "@/script/atoi";
import ZoomInOut from "@/component/zoom_in_out";
import SelectLang from "@/component/select_option";

export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    const DEFAULT_ZOOM: number = 1;
    const DEFAULT_LONG: number = 2.35522;
    const DEFAULT_LAT: number = 48.8566;

    const zoom_number: number = atoi(params.id, DEFAULT_ZOOM);

    const [zoom, setZoom] = useState<number>(zoom_number);
    const [zoom2, setZoom2] = useState<number>(0);
    const [lat, setLat] = useState<number>(DEFAULT_LAT);
    const [long, setLong] = useState<number>(DEFAULT_LONG);
    const [reset, setReset] = useState<number>(0);
    const [relief, setRelief] = useState<boolean>(false);
    const [rain, setRain] = useState<boolean>(false);

    const submitEvent = (event: React.FormEvent) => {
        event.preventDefault();

        const target: HTMLFormElement = event.target as HTMLFormElement;

        const newZoom = atoi(target.zoom.value, DEFAULT_ZOOM);
        const newLat = atoi(target.lat.value, DEFAULT_LAT);
        const newLong = atoi(target.long.value, DEFAULT_LONG);

        setZoom(newZoom);
        setLat(newLat);
        setLong(newLong);
        setReset(1 - reset);
    };

    const [enabled, setEnabled] = useState<boolean>(false);

    const [selected, setSelected] = useState<string>("fr");
    return (
        <>
            <button className={`absolute w-[22px] h-[22px] mt-[120px] ml-[100px] duration-300 text-[15px] rounded-[2px]
                        ${enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                    onClick={() => {setRelief(!relief)}}>
                        {relief ? "2d" : "3d"}</button>
            <button className={`absolute w-[22px] h-[22px] mt-[120px] ml-[132px] duration-300 text-[15px] rounded-[2px]
                        ${enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                    onClick={() => {setRain(!rain)}}>
                        {!rain ? "🌧️" : "☀️"}</button>
            <SelectLang selected={selected} setSelected={setSelected} darkmode={enabled}/>
            <ZoomInOut enabled={enabled} zoom={zoom2} setZoom={setZoom2} />
            <DarkMode enabled={enabled} setEnabled={setEnabled} className="absolute ml-[calc(100%-60px)] mt-[120px]"/>
            <form className="text-customWhite flex flex-col items-center justify-center mt-4"
                    onSubmit={submitEvent}>
                <div className="flex flex-row gap-x-[10vw]">
                    <div className="flex flex-col items-center">
                        <label className="mb-[5px]">Zoom</label>
                        <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                                type="text" name="zoom" defaultValue={zoom.toString()}/>
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="mb-[5px]">Lat</label>
                        <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                                type="text" name="lat" defaultValue={lat.toString()}/>
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="mb-[5px]">Long</label>
                        <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                                type="text" name="long" defaultValue={long.toString()}/>
                    </div>
                </div>
                <button className="
                        rounded-full bg-customGrey2 w-[80px] mt-[30px] h-[30px] border-customGrey2
                        hover:bg-customGrey2Hover hover:border-[2px] hover:border-solid hover:border-customGrey2
                        transition-all duration-200 ease-in-out"
                    type="submit">View</button>
            </form>
            <div className="mt-[30px] flex items-center justify-center w-full">
                <MapDisplay y={lat} x={long} zoom={zoom} zoom2={zoom2} lang={selected} reset={reset} darkMode={enabled} relief={relief} rain={rain}/>
            </div>
        </>
    )
}
