import { JSX } from "react";

export default function HtmlPopup(): JSX.Element
{
    return (<>
            <p className="text-[20px]">Bethsaïde</p>
            <img src="/img/bethsaid.jpg" alt="Bethsaïde" className="w-[250px]"/>
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
    </>);
}
