type ZoomInOutArgs = {
    enabled: boolean;
    setZoom: (z: "in" | "out") => void;
}

export default function ZoomInOut(
    {enabled, setZoom}: ZoomInOutArgs)
{
    return (<>
        <div className={`absolute w-[55px] h-[22px] text-[20px] flex flex-row justify-between mt-[120px] ml-[10px]
                        ${!enabled ? "text-darkMode" : "text-whiteMode"}`}>
            <button className={`rounded-[2px] w-[22px] h-[22px] flex items-center justify-center duration-[300ms]
                        ${enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                        onClick={() => {setZoom("out")}}>-</button>
            <button className={`rounded-[2px] w-[22px] h-[22px] flex items-center justify-center duration-[300ms]
                        ${enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                onClick={() => {setZoom("in")}}>+</button>
        </div>
    </>)
}
