import { use } from "react";
import MapDisplay  from "@/component/map";

export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    return (
        <>
            <p>Map nbr {params.id}</p>
            <MapDisplay x={2.35522} y={48.8566} zoom={10}/>
            <MapDisplay x={2.35522} y={48.8566} zoom={11}/>
            <MapDisplay x={2.35522} y={48.8566} zoom={12}/>
        </>
    )
}
