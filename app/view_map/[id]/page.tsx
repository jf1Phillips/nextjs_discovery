"use client";

import { use, useState } from "react";
import "@/styles/globals.css";
import atoi from "@/script/atoi";
import GetMapboxMap from "@/components/get_map";
import DisplayTxt from "@/components/display_txt";

export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    const [stateTextNbr, setStateTextNbr] = useState<number>(26);
    const [histdate, setHistDate] = useState<number>(1950);
    const [darkMode, setDarkMode] = useState<boolean>(false);

    return (
        <>
            <GetMapboxMap   def_zoom={atoi(params.id, 10) ? 8 : 8}
                            histdate={histdate}
                            textNbr={stateTextNbr}
                            setDarkMode={setDarkMode}/>

            <DisplayTxt     setStateTextNbr={setStateTextNbr}
                            histdate={histdate}
                            setHistDate={setHistDate}
                            darkMode={darkMode}/>
        </>
    );
}
