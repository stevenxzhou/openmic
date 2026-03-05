import { NextResponse, NextRequest } from "next/server";
import { getEventById } from "@/lib/data";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = parseInt(params.id);
        const event = await getEventById(eventId);
        
        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        console.error('Fetch event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

