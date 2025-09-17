"use client";

import React, { use } from "react";
import "@/styles/globals.css";
import atoi from "@/script/atoi";

import GetMapboxMap from "@/component/get_map";

function DisplayTxt(): React.JSX.Element {
    return (<>
        <div className="text-white flex-row flex justify-between
            bg-black fixed mt-[-98px] w-[100%] h-[100px] text-center">
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
    return (
        <>
            <GetMapboxMap def_zoom={atoi(params.id, 10)} />
            <DisplayTxt />
        </>
    )
}
