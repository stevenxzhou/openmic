import { NextResponse, NextRequest } from "next/server";
import { getPerformancesByEventId, createPerformance } from "@/lib/data";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('event_id');
        
        if (!eventId) {
            return NextResponse.json(
                { error: 'event_id query parameter is required' },
                { status: 400 }
            );
        }
        
        const performances = await getPerformancesByEventId(parseInt(eventId));
        return NextResponse.json(performances, { status: 200 });
    } catch (error) {
        console.error('Fetch performances error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const performanceData = await request.json();
        const performance = await createPerformance(performanceData);
        return NextResponse.json(performance, { status: 201 });
    } catch (error) {
        console.error('Create performance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}