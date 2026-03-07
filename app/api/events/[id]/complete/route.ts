import { NextRequest, NextResponse } from "next/server";
import {
  deleteNonCompletedPerformancesByEventId,
  getEventById,
  updateEvent,
} from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const eventId = Number.parseInt(params.id, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const removedCount = await deleteNonCompletedPerformancesByEventId(eventId);

    const updatedEvent = await updateEvent(eventId, {
      ...event,
      status: "COMPLETED",
    });

    return NextResponse.json(
      { event: updatedEvent, removedCount },
      { status: 200 },
    );
  } catch (error) {
    console.error("Complete event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
