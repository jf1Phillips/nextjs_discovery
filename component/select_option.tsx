import "@/styles/globals.css";

interface Args {
    selected: string;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
}

export default function SelectLang({selected, setSelected}: Args)
{
    return (
        <>
            <div className="absolute h-[22px] bg-white text-[15opx] mt-[120px] ml-[164px]">
                <label htmlFor="lang_select">💬</label>
                <select id="lang_select" className="outline-none" value={selected} onChange={(e) => {setSelected(e.target.value);}}>
                    <option value="fr">fr</option>
                    <option value="en">en</option>
                    <option value="it">it</option>
                    <option value="es">es</option>
                </select>
            </div>
        </>
    )
}
