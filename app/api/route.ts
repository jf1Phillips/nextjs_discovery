import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse>
{
    return NextResponse.json(
        {
            api: "hello",
            GET: "/:period",
        },
        {status: 200});
}
