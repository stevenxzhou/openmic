import { NextResponse, NextRequest } from "next/server";

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';

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
        
        const response = await fetch(
            `${openmicApiBase}/api/performances?event_id=${eventId}`, 
            {
                method: 'GET',
                headers: {
                    'Cookie': request.headers.get('cookie') || ''
                },
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || 'Failed to fetch performances' },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
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
        
        const response = await fetch(
            `${openmicApiBase}/api/performances`, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify(performanceData),
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || 'Failed to create performance' },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Create performance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}