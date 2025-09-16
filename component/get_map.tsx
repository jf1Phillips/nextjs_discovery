"use client";

import { JSX } from "react";
import SelectLang from "@/component/select_option";
import ZoomInOut from "@/component/zoom_in_out";
import DarkMode from "@/component/darkmode";
import MapDisplay from "@/component/map";
import React, { useState, useEffect } from "react";

import "@/styles/globals.css";

type MapVar = {
    zoom: number;
    long: number;
    lat: number;
};

const DEFAULT_VALUE: MapVar = {
    zoom: 1,
    long: 2.35522,
    lat: 48.8566,
};


export default function GetMapboxMap (): JSX.Element
{
    const [state, setState] = useState<MapVar>(DEFAULT_VALUE);

    return (
        <>
            <p>Hello</p>
        </>
    )
}
