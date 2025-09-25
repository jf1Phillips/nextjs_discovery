type DarModeArgs = {
    enabled: boolean;
    changeMode: () => void;
    className: string;
}

export default function DarkMode({enabled, changeMode, className}: DarModeArgs) {
    return (<>
        <div className={`${className} flex`}>
            <button onClick={changeMode}
                className={`relative w-[50px] h-[22px] z-0 rounded-full transition-colors duration-300
                    ${enabled ? "bg-darkMode" : "bg-whiteMode"}`}></button>
            <p className={`pointer-events-none text-[15px] transition-margin-left duration-300
                ${enabled ? "ml-[-48px]" : "ml-[-23px]"} z-10`}>
                {enabled ? "🌑" : "🔆"}</p>
        </div>
    </>)
}
