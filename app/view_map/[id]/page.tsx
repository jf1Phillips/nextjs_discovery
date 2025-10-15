"use client";

import React, { use, useState } from "react";
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
    const [enabled, setEnabled] = useState<boolean>(false);
    const [stateTextNbr, setStateTextNbr] = useState<number>(1);
    const [histdate, setHistDate] = useState<number>(1950);

    return (
        <>
            <GetMapboxMap def_zoom={atoi(params.id, 10) ? 8 : 8} histdate={histdate} enbl={enabled} setEnbl={setEnabled} textNbr={stateTextNbr}/>
            <DisplayTxt enabled={enabled}
                        setStateTextNbr={setStateTextNbr}
                        histdate={histdate}
                        setHistDate={setHistDate}/>
        </>
    )
}
