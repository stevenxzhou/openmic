import { NextResponse, NextRequest } from "next/server";
import { movePerformanceToFirst } from "@/lib/data";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { event_id } = await request.json();
        
        if (!event_id) {
            return NextResponse.json(
                { error: 'event_id is required' },
                { status: 400 }
            );
        }
        
        const performance = await movePerformanceToFirst(
            parseInt(params.id),
            event_id
        );
        
        return NextResponse.json(performance, { status: 200 });
    } catch (error) {
        console.error('Move performance to first error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
