import { JSX } from "react";

/**
 * Arguments used to create an HTML popup component.
 *
 * @example
 * // Minimum configuration (only name and coordinates)
 * const popup1: CreateHTMLPopupArgs = {
 *   name: "Location A",
 *   lnglat: [2.3522, 48.8566],
 * };
 *
 * @example
 * // Full configuration with image, description, and links
 * const popup2: CreateHTMLPopupArgs = {
 *   name: "Central Park",
 *   lnglat: [-73.968285, 40.785091],
 *   img_url: "https://example.com/park.jpg",
 *   description: "A large public park in New York City.",
 *   links: [
 *     { url: "https://example.com/info", name: "More info" },
 *     { url: "https://example.com/map" }, // no name provided
 *   ],
 * };
 */
type CreateHTMLPopupArgs = {
    name: string,
    lnglat: [number, number],
    img_url?: string,
    description?: string,
    links?: {url: string, name ?: string}[],
};


/**
 * Creates a styled HTML popup component containing location metadata,
 * an optional image, description text, and external links.
 *
 * This component is typically rendered inside a map marker popup or informational panel.
 *
 * @param {CreateHTMLPopupArgs} props - The data used to populate the popup.
 * @returns {JSX.Element} A fully rendered popup element.
 *
 * @example
 * // Minimal usage
 * <CreateHTMLPopup
 *   name="Test Location"
 *   lnglat={[1.2345, 2.3456]}
 * />
 *
 * @example
 * // With image, description, and links
 * <CreateHTMLPopup
 *   name="Beautiful Place"
 *   lnglat={[10.1234, 20.5678]}
 *   img_url="https://example.com/image.jpg"
 *   description="A very nice place to visit."
 *   links={[
 *     { url: "https://example.com/details", name: "Details" },
 *     { url: "https://example.com/wiki" }, // no name
 *   ]}
/>
 */
function CreateHTMLPopup(props: CreateHTMLPopupArgs): JSX.Element {
    const linkList: JSX.Element[] = [];

    if (props.links) {
        props.links.forEach((link, index) => {
            linkList.push(
                <li key={index}>
                    <a target="_blank" href={link.url}>
                        {link.name ? link.name : link.url}
                    </a>
                </li>
            );
        });
    }
    return (<>
        <div className="flex flex-col overflow-y-auto -ms-overflow-style:none &::-webkit-scrollbar:hidden [scrollbar-width:none]
                    bg-white max-h-[60vh] text-[#555] font-[500] text-[15px] w-[300px] rounded-[5px] p-3">
            {/* Header */}
            <section className="space-y-[-5px]">
                <h1 className="text-[#000] text-[30px] font-[900]">{props.name.toUpperCase()}</h1>
                <p>Longitude : {props.lnglat[0].toFixed(6).toString()}</p>
                <p>Latitude : {props.lnglat[1].toFixed(6).toString()}</p>
            </section>
            {/* ****** */}
            {/* Content */}
            <section>
                {props.img_url && (<>
                    <img src={props.img_url} className="rounded-[5px] mt-5" alt={`Image of ${props.name}`} />
                </>)}
                {props.description && (<>
                    <h1 className="mt-6 mb-2 font-[600] text-[#000]">Description du lieu</h1>
                    <p>{props.description}</p>
                </>)}
                {props.links && (<>
                    <h1 className="mt-6 mb-2 font-[600] text-[#000]">En savoir plus</h1>
                    <ul className="list-disc pl-5 text-[#000]">{linkList}</ul>
                </>)}
            </section>
            {/* ******* */}
        </div>
    </>);
}

export {CreateHTMLPopup, type CreateHTMLPopupArgs};
