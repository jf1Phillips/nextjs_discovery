import { use } from "react";
import MapDisplay from "@/component/map";
import "@/styles/globals.css";

export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    const DEFAULT_ZOOM: number = 10;
    const DEFAULT_LAT: number = 2.35522;
    const DEFAULT_LONG: number = 48.8566;

    var zoom_number: number = Number.isNaN(+params.id) ? DEFAULT_ZOOM : +params.id;
    return (
        <>
            <p className="mt-[40px] text-customWhite flex items-center justify-center">
                Map nbr {params.id}
            </p>
            <form className="mt-[40px] text-customWhite flex flex-col items-center justify-center">
                <div className="flex flex-row gap-x-[50px]">
                    <div className="flex flex-col items-center">
                        <label>Zoom</label>
                        <input className="bg-customGrey2 text-center w-[100px]"
                                type="text" name="zoom" placeholder={zoom_number.toString()}/>
                    </div>
                    <div className="flex flex-col items-center">
                        <label>Lat</label>
                        <input className="bg-customGrey2 text-center w-[100px]"
                                type="text" name="zoom" placeholder={DEFAULT_LAT.toString()}/>
                    </div>
                    <div className="flex flex-col items-center">
                        <label>Long</label>
                        <input className="bg-customGrey2 text-center w-[100px]" 
                                type="text" name="zoom" placeholder={DEFAULT_LONG.toString()}/>
                    </div>
                </div>
                <button className="mt-[10px]" type="submit">View</button>
            </form>
            <div className="mt-[30px] flex items-center justify-center w-full">
                <MapDisplay x={DEFAULT_LAT} y={DEFAULT_LONG} zoom={zoom_number}/>
            </div>
        </>
    )
}
