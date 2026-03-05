import { NextResponse } from "next/server"
import { query } from "@/lib/data"

export async function GET() {
    const rows = await query("SELECT * FROM events;");
    return NextResponse.json(rows, {status: 200});
}