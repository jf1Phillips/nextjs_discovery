"use client";

import React, { use, useEffect, useState } from "react";
import "@/styles/globals.css";
import atoi from "@/script/atoi";

import GetMapboxMap from "@/component/get_map";

function DisplayTxt({enabled}: {enabled: boolean}): React.JSX.Element {
    const [displayText, setDisplayText] = useState<string>("loading...");
    const [textNbr, setTextNbr] = useState<number>(1);

    const api_req: (nbr: number) => string = (nbr:number) => `https://dilexit-back-1001788493975.europe-west9.run.app/bible/pericopes/${nbr}`;
    const set_text_data: (id: number) => void = (id: number) => {
        setDisplayText("loading...");
                fetch(api_req(id)).then(res => res.json()).then(data => {
            setDisplayText(data.name);
        });
    };

    useEffect(() => set_text_data(textNbr), []);
    return (<>
        <div className={`flex-row flex justify-between duration-300 items-center rounded-t-[10px]
            ${enabled ? "bg-darkModeOp text-whiteMode" : "bg-whiteModeOp text-darkMode"}
            fixed mt-[-68px] w-[100%] h-[70] px-[20px]`}>
            <button className={`text-[20px] duration-300 h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                ${enabled ? "bg-whiteMode text-darkMode" : "bg-darkMode text-whiteMode"}`}>{"<"}</button>
            <p className="text-[16px]">{displayText}</p>
            <button className={`text-[20px] duration-300  h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                ${enabled ? "bg-whiteMode text-darkMode" : "bg-darkMode text-whiteMode"}`}>{">"}</button>
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
