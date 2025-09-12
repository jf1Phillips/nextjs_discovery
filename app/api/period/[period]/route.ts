import { NextRequest, NextResponse } from 'next/server';
import { atoii } from "@/script/atoi";

type Params = {
    period: string;
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Params> }
): Promise<NextResponse>
{
    try {
        const { period } = await params;
        const int_id = atoii(period);

        if (period !== "0" && int_id === 0) {
            return NextResponse.json({error: "Invalid format"}, {status: 400});
        }
        return NextResponse.json({id: int_id,}, {status: 200});
    } catch (err) {
        return NextResponse.json({"Internal error": err}, {status: 500});
    }
}
