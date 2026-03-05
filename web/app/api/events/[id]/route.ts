import { NextResponse, NextRequest } from "next/server"
import { query } from "@/lib/data"
import type { Event } from "@/api/event"

export async function GET(_request: NextRequest, { params }: { params: {id: string} }) {
    const rows = await query("SELECT * FROM events where event_id = ?;", [params.id]);
    return NextResponse.json(rows, {status: 200});
}

export async function POST(request: NextRequest, { params }: { params: {id: string} }) {

    const event: Event = await request.json();

    if (params.id) {
        await query(
            "UPDATE events SET start_date = ?, end_date = ?, title = ?, description = ?, location = ? WHERE event_id = ?;",
            [event.start_date, event.end_date, event.title, event.description, event.location, params.id]
        );
    } else {
        await query(
            "INSERT INTO events (start_date, end_date, title, description, location) VALUES (?, ?, ?, ?, ?);",
            [event.start_date, event.end_date, event.title, event.description, event.location]
        );
    }

    return NextResponse.json({status: 200});
}