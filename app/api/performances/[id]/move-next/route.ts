import { NextResponse, NextRequest } from "next/server";
import { movePerformanceNext } from "@/lib/data";

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
        
        const performance = await movePerformanceNext(
            parseInt(params.id),
            event_id
        );
        
        return NextResponse.json(performance, { status: 200 });
    } catch (error) {
        console.error('Move performance next error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
