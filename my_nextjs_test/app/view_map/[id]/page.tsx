export default async function MapNbr(
    props: {
        params: Promise<{id: string}>
    }
) {
    const params = await props.params;
    return (
        <>
            <p>Map nbr {params.id}</p>
        </>
    )
}
