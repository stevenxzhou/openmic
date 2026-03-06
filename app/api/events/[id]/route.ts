import { NextResponse, NextRequest } from "next/server";
import { getEventById, updateEvent, deleteEvent, getEvents } from "@/lib/data";

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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = parseInt(params.id, 10);
        const eventData = await request.json();
        console.log('\n=== PUT /api/events/[id] ===');
        console.log('Event ID being updated:', eventId);
        console.log('New event data:', eventData);
        
        // Check for duplicate events at the same time and location (excluding this event)
        const existingEvents = await getEvents();
        console.log('Existing events from DB:', existingEvents);
        
        // Normalize the incoming start_date for comparison
        const incomingStartDate = String(eventData.start_date).trim().replace(/\.\d{3}Z$/, 'Z');
        const incomingLocation = String(eventData.location).trim();
        
        let duplicateEventId: number | null = null;
        const isDuplicate = existingEvents.some(
            (event: any) => {
                const isOtherEvent = event.event_id !== eventId;
                const existingStartDate = String(event.start_date).trim();
                const existingLocation = String(event.location).trim();
                const startDateMatch = existingStartDate === incomingStartDate;
                const locationMatch = existingLocation === incomingLocation;
                console.log(`Comparing event ${event.event_id}:`, {
                    isOtherEvent,
                    existingStartDate,
                    incomingStartDate,
                    startDateMatch,
                    existingLocation,
                    incomingLocation,
                    locationMatch,
                    isDuplicate: isOtherEvent && startDateMatch && locationMatch,
                });
                
                if (isOtherEvent && startDateMatch && locationMatch) {
                    duplicateEventId = event.event_id;
                    return true;
                }
                return false;
            }
        );
        
        console.log('Final isDuplicate result:', isDuplicate);
        
        if (isDuplicate) {
            console.log('Duplicate found, returning 409');
            return NextResponse.json(
                { error: 'An event already exists at this location and time', eventId: duplicateEventId },
                { status: 409 }
            );
        }
        
        const event = await updateEvent(eventId, eventData);
        return NextResponse.json(event, { status: 200 });
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
        const eventId = parseInt(params.id, 10);
        await deleteEvent(eventId);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

