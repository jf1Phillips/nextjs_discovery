"use client";

import { Map as MapboxMap, Layer } from "mapbox-gl"
import { JSX, useState } from "react"

/**
 * Arguments for the {@link Cursor} component.
 *
 * Represents the configuration options used to render
 * a slider UI element that controls the opacity of
 * specific map layers in a Mapbox map.
 */
interface ArgsCursor {
    /** Display name shown next to the slider. */
    name: string;
    /**
     * One or more substrings used to match map layer IDs.
     * Layers containing any of these strings in their IDs
     * will have their opacity adjusted by the slider.
     */
    include: string | string[];
    /** Reference to the Mapbox map instance. */
    map: React.RefObject<MapboxMap | null>;
    /** Optional CSS class name(s) for styling the slider container. */
    className?: string;
    /** Default slider value (from 0 to 100). */
    def?: number;
    /** Whether dark mode is enabled. */
    enabled?: boolean;
}

/**
 * Updates the opacity of specific map layers based on their type.
 *
 * This internal utility function iterates through all layers in the current map style
 * and adjusts their opacity depending on the `value` provided.
 * The layers to be affected are filtered by their ID, which must include
 * one or more specified substrings from `include`.
 *
 * Supported layer types:
 * - **raster** → `raster-opacity`
 * - **symbol** → `text-opacity`, `icon-opacity`
 * - **line** → `line-opacity`
 * - **fill** → `fill-opacity`
 * - **fill-extrusion** → `fill-extrusion-opacity`
 *
 * @param map - The Mapbox map instance to modify.
 * @param value - The opacity percentage (0–100).
 * @param include - A string or array of strings; only layers whose IDs include one of these values will be affected.
 *
 * @example
 * // Set all 'road' layers to 50% opacity
 * set_paint(map, 50, 'road');
 *
 * // Set multiple categories of layers
 * set_paint(map, 30, ['building', 'park']);
 */
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
        'fill-extrusion': (layer) => map.setPaintProperty(layer.id, "fill-extrusion-opacity", value / 100.0),
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

/**
 * Renders a slider component that controls the opacity
 * of selected Mapbox layers in real time.
 *
 * This component listens for user input on the range slider,
 * updates its internal state, and applies the new opacity
 * to all map layers whose IDs include the given substring(s).
 *
 * @param name - The label displayed next to the slider.
 * @param include - One or more strings used to filter map layers by ID.
 * @param map - A reference to the active Mapbox map instance.
 * @param def - The initial opacity value (default is 0 if not provided).
 * @param className - Additional class names for the component container.
 * @param enabled - Indicates whether dark mode styling is active.
 * @returns A JSX element representing the slider and its label.
 *
 * @example
 * ```tsx
 * <Cursor
 *   name="Roads"
 *   include="road"
 *   map={mapRef}
 *   def={50}
 *   enabled={darkMode}
 * />
 * ```
 */
function Cursor({name, include, map, def, className, enabled} : ArgsCursor): JSX.Element {
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

export {Cursor};
