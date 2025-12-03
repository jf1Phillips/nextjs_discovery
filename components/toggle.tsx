"use client";

import { Map as MapboxMap, Layer } from "mapbox-gl"
import { JSX, useState } from "react"

type ToggleArgs = {
    text: string,
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    darkmode?: boolean,
};

export default function Toggle(
    {
        text,
        defaultChecked = false,
        onChange,
        darkmode = false,
    }: ToggleArgs
): JSX.Element {
    const [isChecked, setIsChecked] = useState(defaultChecked);

    const handleToggle = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        onChange?.(newValue);
    };

    return (<>
        <div className="flex items-center space-x-3">
            <div className={`flex cursor-pointer rounded-full duration-300 w-11 h-5 items-center
                ${!darkmode ? "bg-whiteMode text-darkMode" : "bg-bgWhiteMode text-whiteMode"}`}
                onClick={handleToggle}>
                <span className={`
                            pointer-events-none select-none
                            inline-block h-4 w-4 transform rounded-full
                            ${darkmode ? "bg-whiteMode": "bg-darkMode"}
                            duration-300
                            ${isChecked ? 'translate-x-6' : 'translate-x-1'}
                        `}>
                </span>
            </div>
            <p className={`
                ${darkmode ? "text-white" : "text-[#000] duration-300"}
                pointer-events-none text-[13px]`}>{text}</p>
        </div>
    </>);
}
