"use client";

import React, { use, useState } from "react";
import "@/styles/globals.css";
import atoi from "@/script/atoi";
import DarkMode from "@/component/darkmode";

import GetMapboxMap from "@/component/get_map";

function DisplayTxt({enabled}: {enabled: boolean}): React.JSX.Element {
    return (<>
        <div className={`flex-row flex justify-between duration-300
            ${enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}
            fixed mt-[-98px] w-[100%] h-[100px]`}>
            <button>{"<"}</button>
            <p className="">Test</p>
            <button>{">"}</button>
        </div>
    </>);
}

export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    const [enabled, setEnabled] = useState<boolean>(false);

    return (
        <>
            <GetMapboxMap def_zoom={atoi(params.id, 10)} enbl={enabled} setEnbl={setEnabled} />
            <DisplayTxt enabled={enabled} />
        </>
    )
}
