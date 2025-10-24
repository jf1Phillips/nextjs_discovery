import { JSX } from "react";
import Image from "next/image";

/**
 * Represents a mapping between a town name and its corresponding JSX content.
 *
 * This interface is typically used to associate a location or city
 * with a block of JSX that provides related information, such as
 * descriptive text, images, or links.
 *
 * @example
 * ```tsx
 * const JSXLabels: DicoJsx[] = [
 *   {
 *     town: "Bethsaïde",
 *     jsx: (
 *       <>
 *         <p className="mb-2 text-[20px]">Bethsaïde</p>
 *         <Image src="/img/bethsaid.jpg" alt="Bethsaïde" width={250} height={0}/>
 *         <p className="text-justify p-2 text-[15px]">
 *           {`Ville galiléenne détruite par un tremblement de terre vers 324 après J.-C.`}
 *         </p>
 *       </>
 *     )
 *   }
 * ];
 * ```
 * @remarks
 * The `jsx` property supports any valid JSX content, including elements styled  
 * with **Tailwind CSS** utility classes for rapid and consistent UI design.
 */
type DicoJsx = {
    /** Name of the town or location associated with the JSX content. */
    town: string;
    /** JSX content describing or illustrating the town (text, images, links, etc.). */
    jsx: JSX.Element;
};

const JSXLabels: DicoJsx[] = [
    {
        town: "Bethsaïda",
        jsx: (<>
            <p className="mb-2 text-[20px]">Bethsaïde</p>
            <Image src="/img/bethsaid.jpg" alt="Bethsaïde" width={250} height={0}/>
            <p className="text-justify p-2 text-[15px]">{`
                La ville galiléenne de Bethsaïde fut détruite par un tremblement de terre
                vers l'an 324 après Jésus Christ. Elle fut retrouvée en 1987 par un consortium
                d'universités menée par l'Université du Nebraska à Omaha, conduit par
                le professeur de religion et de philosophie israélien Dr. Rami Arav, sur
                le site de et-Tell, à 2 kilomètres au nord-est du lac de Tibériade.
                Cet emplacement correspond exactement à la dictée du Christ transmis à Maria
                Valtorta du 4 juin 1947 dans laquelle il lui explique qu'en raison de
                « vingt siècles d'alluvions apportés par le fleuve et par les éboulis descendus des collines »,
                la ville se trouve désormais au milieu des terres et non plus « à l'embouchure du
                fleuve dans le lac » (L'Évangile tel qu'il m'a été révélé, chapitre 179.1).
            `}</p>
        </>)
    },
    {
        town: "Gomorrhe ?",
        jsx: (<>
            <p className="mb-2 font-bold text-[20px]">Gomorrhe ?</p>
            <a className="mb-2 text-center" target="_blank" href="https://edifiant.fr/sodome-et-gomorrhe/">{`https://edifiant.fr/sodome-et-gomorrhe/`}</a>
            <a className="text-center" target="_blank" href="https://www.youtube.com/watch?v=YpdYveOi28A">{`https://www.youtube.com/watch?v=YpdYveOi28A`}</a>
        </>)
    },
    {
        town: "Sodome ?",
        jsx: (<>
            <p className="mb-2 font-bold text-[20px]">Sodome ?</p>
            <a className="mb-2 text-center" target="_blank" href="https://edifiant.fr/sodome-et-gomorrhe/">{`https://edifiant.fr/sodome-et-gomorrhe/`}</a>
            <a className="mb-2 text-center" target="_blank" href="https://tallelhammam.com/">{`https://tallelhammam.com/`}</a>
            <a className="text-center" target="_blank" href="https://www.youtube.com/watch?v=YpdYveOi28A">{`https://www.youtube.com/watch?v=YpdYveOi28A`}</a>
        </>)
    }
];

export {JSXLabels, type DicoJsx};
