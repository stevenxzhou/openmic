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
        console.log('\n=== POST /api/events ===');
        console.log('Incoming event data:', JSON.stringify(eventData, null, 2));
        
        // Check for duplicate events at the same time and location
        const existingEvents = await getEvents();
        console.log('Number of existing events:', existingEvents.length);
        console.log('Existing events:', JSON.stringify(existingEvents, null, 2));
        
        // Normalize the incoming start_date for comparison
        const incomingStartDate = String(eventData.start_date).trim().replace(/\.\d{3}Z$/, 'Z');
        const incomingLocation = String(eventData.location).trim();
        
        console.log('Looking for duplicates with:', {
            start_date: incomingStartDate,
            location: incomingLocation,
        });
        
        let duplicateEventId: number | null = null;
        const isDuplicate = existingEvents.some(
            (event: any) => {
                const existingStartDate = String(event.start_date).trim();
                const existingLocation = String(event.location).trim();
                
                const startDateMatch = existingStartDate === incomingStartDate;
                const locationMatch = existingLocation === incomingLocation;
                
                console.log(`Event ${event.event_id}:`, {
                    existingStartDate,
                    incomingStartDate,
                    startDateMatch,
                    existingLocation,
                    incomingLocation,
                    locationMatch,
                    isDuplicate: startDateMatch && locationMatch,
                });
                
                if (startDateMatch && locationMatch) {
                    duplicateEventId = event.event_id;
                    return true;
                }
                return false;
            }
        );
        
        console.log('Final isDuplicate result:', isDuplicate);
        
        if (isDuplicate) {
            console.log('DUPLICATE DETECTED - Returning 409 error');
            return NextResponse.json(
                { error: 'An event already exists at this location and time', eventId: duplicateEventId },
                { status: 409 }
            );
        }
        
        console.log('No duplicate found, creating event');
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