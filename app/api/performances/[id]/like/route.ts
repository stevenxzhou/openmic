import { NextResponse, NextRequest } from "next/server";
import { decrementPerformanceLikes, incrementPerformanceLikes } from "@/lib/data";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const performance = await incrementPerformanceLikes(parseInt(params.id));
        
        if (!performance) {
            return NextResponse.json(
                { error: 'Performance not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(performance, { status: 200 });
    } catch (error) {
        console.error('Like performance error:', error);
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
        const performance = await decrementPerformanceLikes(parseInt(params.id));

        if (!performance) {
            return NextResponse.json(
                { error: 'Performance not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(performance, { status: 200 });
    } catch (error) {
        console.error('Unlike performance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
