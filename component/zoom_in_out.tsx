type ZoomInOutArgs = {
    enabled: boolean;
    zoom: number;
    setZoom: React.Dispatch<React.SetStateAction<number>>;
}

export default function ZoomInOut(
    {enabled, zoom, setZoom}: ZoomInOutArgs)
{
    return (<>
        <div className={`absolute w-[55px] h-[22px] text-[20px] flex flex-row justify-between mt-[120px] ml-[10px]
                        ${!enabled ? "text-darkMode" : "text-whiteMode"}`}>
            <button className={`rounded-[2px] w-[22px] h-[22px] flex items-center justify-center duration-[300ms]
                        ${enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                        onClick={() => {setZoom(zoom - 1)}}>-</button>
            <button className={`rounded-[2px] w-[22px] h-[22px] flex items-center justify-center duration-[300ms]
                        ${enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                onClick={() => {setZoom(zoom + 1)}}>+</button>
        </div>
    </>)
}
