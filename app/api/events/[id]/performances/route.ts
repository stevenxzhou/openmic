import { NextResponse, NextRequest } from "next/server"
import { query } from "@/lib/data"

export async function GET(_request: NextRequest, { params }: { params: {id: string} }) {
    const rows = await query("SELECT songs, status, users.email as email, users.user_id AS user_id, performance_id, performance_index, first_name, last_name, events.event_id AS event_id FROM performances LEFT JOIN users ON performances.user_id = users.user_id LEFT JOIN events ON events.event_id = performances.event_id WHERE events.event_id = ?;", [params.id]);
    return NextResponse.json(rows, {status: 200});
}