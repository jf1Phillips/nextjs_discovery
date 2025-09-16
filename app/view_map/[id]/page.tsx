"use client";

import React, { use } from "react";
import "@/styles/globals.css";
import atoi from "@/script/atoi";

import GetMapboxMap from "@/component/get_map";

export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    return (
        <>
            <GetMapboxMap def_zoom={atoi(params.id, 10)} />
        </>
    )
}
