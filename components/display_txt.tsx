"use client";

import { useState } from "react";

export const BDD_ULR: string = "https://om-backend-315602396963.europe-west9.run.app/";
const BIBLE_ID: number = 5;

export interface DisplayArgs {
    setStateTextNbr: (val: number) => void,
    histdate: number,
    setHistDate: (val: number) => void,
    darkMode: boolean,
};

export default function DisplayTxt({ setStateTextNbr, histdate, setHistDate, darkMode }: DisplayArgs): React.JSX.Element {
    const [displayText, setDisplayText] = useState<string>("start...");
    const [textNbr, setTextNbr] = useState<number>(1);
    const [up, setUp] = useState<boolean>(false);

    // const api_req: (nbr: number) => string = (nbr: number) => `${BDD_ULR}${nbr}`;
    // const set_text_data: (id: number) => void = (id: number) => {
    //     setDisplayText("loading...");
    //     fetch(api_req(id)).then(res => res.json()).then(data => {
    //         setDisplayText(id.toString());
    //         setStateTextNbr(id);
    //         setTextNbr(id);
    //     });
    // };

    // if (displayText == "start...")
    //     set_text_data(textNbr);
    const click_btn: (add: number) => void = (add: number) => {
        // let new_nbr: number = textNbr + add;
        // const max = 50;

        // if (new_nbr <= 0) new_nbr = max;
        // if (new_nbr > max) new_nbr = 1;
        // set_text_data(new_nbr);
        // setHistDate(histdate + add);
    };
    return (<>
        <div className={`absolute w-full flex justify-center h-[50px] items-center duration-300
                ${up ? "bottom-[200px]" : "bottom-[70px]"}`}>
            <button className={`w-[30px] h-[30px] text-[15px] rounded-full duration-200
                flex items-center justify-center hover:mb-[10px]
                ${darkMode ? "bg-whiteMode text-darMode" : "bg-bgWhiteMode text-whiteMode"}`}
                onClick={() => setUp(!up)}>{!up ? "△" : "▽"}</button>
        </div>
        <div className={`flex-row flex justify-between duration-300 rounded-t-[10px]
            ${darkMode ? "bg-darkMode text-whiteMode" : "bg-bgDarkMode text-darkMode"}
                ${up ? "h-[200px] pt-[20px]" : "h-[70px] items-center"}
                absolute bottom-0 w-full px-[20px]`}>
            <button className={`text-[20px] duration-300 h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                ${darkMode ? "bg-whiteMode text-darkMode" : "bg-bgWhiteMode text-whiteMode"}`}
                onClick={() => { click_btn(-1) }}
            >{"<"}</button>
            <p className="text-[16px]">Chapitre {displayText}</p>
            <button className={`text-[20px] duration-300  h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                ${darkMode ? "bg-whiteMode text-darkMode" : "bg-bgWhiteMode text-whiteMode"}`}
                onClick={() => { click_btn(1) }}
            >{">"}</button>
            <div className="scaleDiv right-[10px] top-[-30px] absolute"></div>
        </div>
    </>);
}
