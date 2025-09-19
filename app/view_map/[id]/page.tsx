"use client";

import React, { use, useState } from "react";
import "@/styles/globals.css";
import atoi from "@/script/atoi";

import GetMapboxMap from "@/component/get_map";

function DisplayTxt({enabled, setStateTextNbr}:
    {enabled: boolean, setStateTextNbr:  React.Dispatch<React.SetStateAction<number>>}):React.JSX.Element
{
    const [displayText, setDisplayText] = useState<string>("start...");
    const [textNbr, setTextNbr] = useState<number>(1);
    const [up, setUp] = useState<boolean>(false);

    const api_req: (nbr: number) => string = (nbr:number) => `https://dilexit-back-1001788493975.europe-west9.run.app/bible/pericopes/${nbr}`;
    const set_text_data: (id: number) => void = (id: number) => {
        setDisplayText("loading...");
                fetch(api_req(id)).then(res => res.json()).then(data => {
            setDisplayText(data.name);
        });
        setStateTextNbr(id);
    };

    if (displayText == "start...")
        set_text_data(textNbr);
    const click_btn: (add: number) => void = (add: number) => {
        let new_nbr: number = textNbr + add;
        const max = 50;

        if (new_nbr <= 0) new_nbr = max;
        if (new_nbr > max) new_nbr = 1;
        setTextNbr(new_nbr);
        set_text_data(new_nbr);
    };
    return (<>
        <div className={`absolute w-full flex justify-center h-[50px] items-center duration-300
                ${up ? "bottom-[200px]" : "bottom-[70px]"}`}>
            <button className={`w-[30px] h-[30px] text-[15px] rounded-full duration-200
                flex items-center justify-center hover:mb-[10px]
                ${enabled ? "bg-whiteModeOp text-darMode" : "bg-darkModeOp text-whiteMode"}`}
                onClick={() => setUp(!up)}>{!up ? "△" : "▽"}</button>
        </div>

        <div className={`flex-row flex justify-between duration-300 rounded-t-[10px]
            ${enabled ? "bg-darkModeOp text-whiteMode" : "bg-whiteModeOp text-darkMode"}
                ${up ? "h-[200px] pt-[20px]" : "h-[70px] items-center"}
                absolute bottom-0 w-full px-[20px]`}>
            <button className={`text-[20px] duration-300 h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                ${enabled ? "bg-whiteMode text-darkMode" : "bg-darkMode text-whiteMode"}`}
                onClick={() => {click_btn(-1)}}
                >{"<"}</button>
            <p className="text-[16px]">{displayText}</p>
            <button className={`text-[20px] duration-300  h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                ${enabled ? "bg-whiteMode text-darkMode" : "bg-darkMode text-whiteMode"}`}
                onClick={() => {click_btn(1)}}
                >{">"}</button>
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
    const [stateTextNbr, setStateTextNbr] = useState<number>(1);


    return (
        <>
            <GetMapboxMap def_zoom={atoi(params.id, 10)} enbl={enabled} setEnbl={setEnabled} textNbr={stateTextNbr}/>
            <DisplayTxt enabled={enabled} setStateTextNbr={setStateTextNbr}/>
        </>
    )
}
