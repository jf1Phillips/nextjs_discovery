"use client";

import { use, useState } from "react";
import MapDisplay from "@/component/map";
import "@/styles/globals.css";
import atoi from "@/script/atoi";


export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    const DEFAULT_ZOOM: number = 10;
    const DEFAULT_LONG: number = 2.35522;
    const DEFAULT_LAT: number = 48.8566;

    const zoom_number: number = atoi(params.id, DEFAULT_ZOOM);

    const [zoom, setZoom] = useState<number>(zoom_number);
    const [lat, setLat] = useState<number>(DEFAULT_LAT);
    const [long, setLong] = useState<number>(DEFAULT_LONG);

    const submitEvent = (event: React.FormEvent) => {
        event.preventDefault();

        const target: HTMLFormElement = event.target as HTMLFormElement;

        const newZoom = atoi(target.zoom.value, DEFAULT_ZOOM);
        const newLat = atoi(target.lat.value, DEFAULT_LAT);
        const newLong = atoi(target.long.value, DEFAULT_LONG);

        setZoom(newZoom);
        setLat(newLat);
        setLong(newLong);
    };
    return (
        <>
            <p className="mt-[40px] text-customWhite flex items-center justify-center">
                Map zoom: {zoom}
            </p>
            <form className="mt-[40px] text-customWhite flex flex-col items-center justify-center"
                    onSubmit={submitEvent}>
                <div className="flex flex-row gap-x-[50px]">
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
                <MapDisplay y={lat} x={long} zoom={zoom}/>
            </div>
        </>
    )
}
