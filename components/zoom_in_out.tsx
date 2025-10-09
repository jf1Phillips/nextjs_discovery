type ZoomInOutArgs = {
    enabled: boolean;
    setZoom: (z: "in" | "out") => void;
}

export default function ZoomInOut(
    {enabled, setZoom}: ZoomInOutArgs)
{
    return (<>
        <div className={`absolute w-[60px] h-[22px] text-[20px] flex flex-row justify-between top-[80px] right-[80px]
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
