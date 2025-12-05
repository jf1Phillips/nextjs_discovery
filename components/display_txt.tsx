"use client";

import { useEffect, useRef, useState } from "react";

export const BDD_ULR: string = "https://om-backend-315602396963.europe-west9.run.app";
// const BIBLE_ID: number = 5;

interface ApiScheme {
    poemChapter: {
        chapter: number,
        name: string,
        poemSections: {
            name: string,
            entityLocations: {
                name?: string,
                longitude?: number,
                latitude?: number,
                [key: string]: unknown,
            }[],
            [key: string]: unknown,
        }[],
        [key: string]: unknown,
    },
    [key: string]: unknown,
};

const filtersMemory: Map<number, ApiScheme> = new Map();

async function loadChapterData(chatperId: number): Promise<ApiScheme | undefined> {
    try {
        if (!filtersMemory.has(chatperId)) {
            const response = await fetch(`${BDD_ULR}/poem/chapters/${chatperId}`);
            if (!response.ok) {
                return undefined;
            }
            const data: ApiScheme = await response.json();
            filtersMemory.set(chatperId, data);
        }
        const scheme: ApiScheme | undefined = filtersMemory.get(chatperId);
        return scheme;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

export interface DisplayArgs {
    setStateTextNbr: (val: number) => void,
    histdate: number,
    setHistDate: (val: number) => void,
    darkMode: boolean,
};

export default function DisplayTxt({ setStateTextNbr, histdate, setHistDate, darkMode }: DisplayArgs): React.JSX.Element {
    const [displayText, setDisplayText] = useState<string>("start...");
    const [chapterName, setChapterName] = useState<string>("Loading...");
    const [textNbr, setTextNbr] = useState<number>(26);
    const [up, setUp] = useState<boolean>(false);

    const click_btn: (add: number) => void = (add: number) => {
        const maxNbr = 50;
        const minNbr = 26;
        const addNbr = textNbr + add;
        const nbr: number = addNbr > maxNbr ? minNbr : addNbr < minNbr ? maxNbr : addNbr;

        setChapterName("Loading...");
        setDisplayText("Loading...");
        loadChapterData(nbr).then((res) => {
            if (res == undefined) return;
            setTextNbr(nbr);
            setStateTextNbr(nbr);
            setDisplayText(res.poemChapter.chapter.toString());
            setChapterName(res.poemChapter.name);
        });
        setHistDate(histdate + add);
    };

    const scaleDivRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!scaleDivRef) return;
        click_btn(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (<>
        <div className={`absolute w-full flex justify-center h-[50px] items-center duration-300
                ${up ? "bottom-[200px]" : "bottom-[70px]"}`}>
            <button className={`w-[30px] h-[30px] text-[15px] rounded-full duration-200
                flex items-center justify-center hover:mb-[10px]
                ${darkMode ? "bg-whiteMode text-darMode" : "bg-bgWhiteMode text-whiteMode"}`}
                onClick={() => setUp(!up)}>{!up ? "△" : "▽"}</button>
        </div>
        <div className={`rounded-t-[10px] flex flex-col space-y-5 duration-300  pt-4
            ${darkMode ? "bg-darkMode text-whiteMode" : "bg-bgDarkMode text-darkMode"}
                ${up ? "h-[200px]" : "h-[70px]"}
                absolute bottom-0 w-full px-[20px]`}>
            <div className="flex-row flex justify-between duration-300">
                <button className={`text-[20px] duration-300 h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                    ${darkMode ? "bg-whiteMode text-darkMode" : "bg-bgWhiteMode text-whiteMode"}`}
                    onClick={() => { click_btn(-1) }}
                >{"<"}</button>
                <p className="text-[16px]">Chapitre {displayText}</p>
                <button className={`text-[20px] duration-300  h-[25px] w-[40px] items-center justify-center flex rounded-[5px]
                    ${darkMode ? "bg-whiteMode text-darkMode" : "bg-bgWhiteMode text-whiteMode"}`}
                    onClick={() => { click_btn(1) }}
                >{">"}</button>
            </div>
            <p className={`
                ${!up && "hidden"}
                ml-auto mr-auto`}>{chapterName}</p>
            <div ref={scaleDivRef} className="scaleDiv right-[10px] top-[-50px] absolute"></div>
        </div>
    </>);
}
