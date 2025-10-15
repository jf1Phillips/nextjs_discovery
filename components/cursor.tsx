import { Map as MapboxMap, Layer } from "mapbox-gl"
import { JSX } from "react"

interface ArgsCursor
{
    sliderValue: number,
    setSliderValue: React.Dispatch<React.SetStateAction<number>>,
    name: string,
    include: string,
    className?: string,
    map: MapboxMap | null,
    enabled?: boolean,
};

export default function Cursor({sliderValue, setSliderValue, name, include, className, map, enabled} : ArgsCursor): JSX.Element {
    const changeOpacity = (value: number) => {
        setSliderValue(value);
        if (!map) return;
        const layers = map.getStyle()?.layers || [];

        type PaintPropertyName = Parameters<typeof map.setPaintProperty>[1];
        const set_paint_property = (layer: Layer, type: PaintPropertyName) => {
            if (!layer.paint) return;
            if (type in layer.paint)
                map.setPaintProperty(layer.id, type, value / 100.0);
        };
        layers.forEach(layer => {
            if (layer.id.includes(include)) {
                set_paint_property(layer, "raster-opacity");
                set_paint_property(layer, "text-opacity");
                set_paint_property(layer, "icon-opacity");
                set_paint_property(layer, "line-opacity");
            }
        });
    };

    return (<>
    <div className={`relative h-[22px] flex items-center text-[13px] duration-300 space-x-[10px] ${className}
            ${!enabled ? "text-whiteMode" : "text-darkMode"}`}>
        <input type="range" min={0} max={100} value={sliderValue} onChange={e => changeOpacity(Number(e.target.value))}
            className={`w-[62px] h-[10px] rounded-lg appearance-none cursor-pointer duration-300
            ${!enabled ? "bg-whiteMode accent-darkMode" : "bg-darkMode accent-whiteMode"}`}
        />
        <p className="min-w-[20px]">{sliderValue}</p>
        <p>{name}</p>
    </div>
    </>);
}
