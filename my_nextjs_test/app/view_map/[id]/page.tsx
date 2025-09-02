import { use } from "react";
import MapDisplay from "@/component/map";
import styles from './map.module.css';

export default function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = use(props.params);
    return (
        <>
            <p>Map nbr {params.id}</p>
            <div className={styles.map}>
                <MapDisplay x={2.35522} y={48.8566} zoom={12}/>
            </div>
        </>
    )
}
