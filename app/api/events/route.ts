import { NextResponse, NextRequest } from "next/server";

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(
            `${openmicApiBase}/api/events`, 
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
                { error: errorText || 'Failed to fetch events' },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
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
        
        const response = await fetch(
            `${openmicApiBase}/api/events`, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify(eventData),
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || 'Failed to create event' },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}