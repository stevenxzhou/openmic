import { NextResponse, NextRequest } from "next/server";

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(
            `${openmicApiBase}/api/events/${params.id}`,
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
                { error: errorText || 'Failed to fetch event' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Fetch event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventData = await request.json();

        const response = await fetch(
            `${openmicApiBase}/api/events/${params.id}`,
            {
                method: 'PUT',
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
                { error: errorText || 'Failed to update event' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Update event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(
            `${openmicApiBase}/api/events/${params.id}`,
            {
                method: 'DELETE',
                headers: {
                    'Cookie': request.headers.get('cookie') || ''
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || 'Failed to delete event' },
                { status: response.status }
            );
        }

        // Handle 204 No Content response
        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
