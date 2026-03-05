import { NextResponse, NextRequest } from "next/server";
import { getPerformanceById, updatePerformance, deletePerformance } from "@/lib/data";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const performance = await getPerformanceById(parseInt(params.id));
        
        if (!performance) {
            return NextResponse.json(
                { error: 'Performance not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(performance, { status: 200 });
    } catch (error) {
        console.error('Fetch performance error:', error);
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
        const performanceData = await request.json();
        const performance = await updatePerformance(parseInt(params.id), performanceData);
        return NextResponse.json(performance, { status: 200 });
    } catch (error) {
        console.error('Update performance error:', error);
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
        await deletePerformance(parseInt(params.id));
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Delete performance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

