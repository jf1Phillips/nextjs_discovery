"use client";

import { Map as MapboxMap, Layer } from "mapbox-gl"
import { JSX, useState } from "react"

type ToggleArgs = {
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
};

export default function Toggle(
    {
        defaultChecked = false,
        onChange,
    }: ToggleArgs
): JSX.Element {
    const [isChecked, setIsChecked] = useState(defaultChecked);

    const handleToggle = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        onChange?.(newValue);
    };

    return (
        <button
            role="switch"
            aria-checked={isChecked}
            onClick={handleToggle}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors duration-200 ease-in-out focus:outline-none
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isChecked ? 'bg-blue-600' : 'bg-gray-300'}
            `}>
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white 
                    transition-transform duration-200 ease-in-out
                    ${isChecked ? 'translate-x-6' : 'translate-x-1'}
                `}
            />
        </button>
    );
}
