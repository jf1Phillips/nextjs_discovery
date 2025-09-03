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
            <p className="mt-[50px] text-customWhite flex items-center justify-center">
                Map nbr {params.id}
            </p>
            <form className="text-customWhite">
                <label>Zoom</label>
                <input type="text" name="zoom" defaultValue={zoom_number}/>
                <label>Lat</label>
                <input type="text" name="zoom" defaultValue={DEFAULT_LAT}/>
                <label>Long</label>
                <input type="text" name="zoom" defaultValue={DEFAULT_LONG}/>
            </form>
            <div className="mt-[40px] flex items-center justify-center w-full">
                <MapDisplay x={DEFAULT_LAT} y={DEFAULT_LONG} zoom={zoom_number}/>
            </div>
        </>
    )
}
