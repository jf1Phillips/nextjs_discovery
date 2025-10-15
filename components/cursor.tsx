"use client";

import { Map as MapboxMap, Layer } from "mapbox-gl"
import { JSX, useState } from "react"

interface ArgsCursor
{
    name: string,
    include: string | string[],
    map: React.RefObject<MapboxMap | null>,
    className?: string,
    def?: number,
    enabled?: boolean,
};

function set_paint(map: MapboxMap, value: number, include: string | string[])
{
    const layers = map.getStyle()?.layers || [];

    const opacity_dico: {[key: string]: ((layer: Layer) => void) | undefined} ={
        'raster': (layer) => map.setPaintProperty(layer.id, 'raster-opacity', value / 100.0),
        'symbol': (layer) => {
            map.setPaintProperty(layer.id, 'text-opacity', value / 100.0)
            map.setPaintProperty(layer.id, 'icon-opacity', value / 100.0)},
        'line': (layer) => map.setPaintProperty(layer.id, 'line-opacity', value / 100.0),
        'fill': (layer) => map.setPaintProperty(layer.id, 'fill-opacity', value / 100.0),
    }

    const for_func = (include: string) => {
        layers.forEach(layer => {
            if (layer.id.includes(include)) {
                const set_opacity_function = opacity_dico[layer.type];
                if (set_opacity_function) set_opacity_function(layer);
            }
        });
    };

    if (typeof include === 'string') {
        for_func(include);
    } else {
        include.forEach(inc => for_func(inc));
    }
}

export default function Cursor({name, include, map, def, className, enabled} : ArgsCursor): JSX.Element {
    const [sliderValue, setSliderValue] = useState<number>(def ? def : 0);

    const changeOpacity = (value: number) => {
        setSliderValue(value);
        if (map.current?.isStyleLoaded) {
            set_paint(map.current as MapboxMap, value, include);
        }
    };

    return (<>
    <div className={`relative h-[22px] flex items-center text-[13px] duration-300 space-x-[10px] ${className}
            ${!enabled ? "text-whiteMode" : "text-darkMode"}`}>
        <input type="range" min={0} max={100} value={sliderValue} onChange={e => changeOpacity(Number(e.target.value))}
            className={`w-[62px] h-[10px] rounded-lg appearance-none cursor-pointer duration-300
            ${!enabled ? "bg-whiteMode accent-darkMode" : "bg-darkMode accent-whiteMode"}`}
        />
        <p className="min-w-[23px]">{sliderValue}</p>
        <p>{name}</p>
    </div>
    </>);
}
