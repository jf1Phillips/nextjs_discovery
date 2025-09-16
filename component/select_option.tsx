import "@/styles/globals.css";

interface Args {
    setSelected: (lang: string) => void;
    darkmode ?: boolean;
}

export default function SelectLang({setSelected, darkmode}: Args)
{
    return (
        <>
            <div className={`absolute h-[22px] text-[15opx] mt-[120px] ml-[164px] rounded-[4px] duration-300
                    ${darkmode ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}>
                <label htmlFor="lang_select" className="ml-[4px]">💬</label>
                <select id="lang_select" className={`outline-none mr-[4px] duration-300
                        ${darkmode ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                        onChange={(e) => {setSelected(e.target.value);}}>
                    <option value="fr">fr</option>
                    <option value="en">en</option>
                    <option value="it">it</option>
                    <option value="es">es</option>
                </select>
            </div>
        </>
    )
}
