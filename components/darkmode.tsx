type DarModeArgs = {
    enabled: boolean;
    changeMode: () => void;
}

export default function DarkMode({enabled, changeMode}: DarModeArgs) {
    return (<>
        <div className={`flex cursor-pointer rounded-full duration-300
                w-[60px] z-10
                ${enabled ? "bg-darkMode" : "bg-whiteMode"}`} onClick={changeMode}>
            <p className={`pointer-events-none text-[15px] select-none duration-300
                 z-10 ml-[5px] mr-[5px]
                 ${enabled ? "translate-x-0" : "translate-x-[30px]"}`}>
                {enabled ? "🌑" : "🔆"}</p>
        </div>
    </>)
}
