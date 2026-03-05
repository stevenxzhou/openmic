import { NextResponse, NextRequest } from "next/server";
import { getEvents, createEvent } from "@/lib/data";

export async function GET(request: NextRequest) {
    try {
        const events = await getEvents();
        return NextResponse.json(events, { status: 200 });
    } catch (error) {
        console.error('Fetch events error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const eventData = await request.json();
        const event = await createEvent(eventData);
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}