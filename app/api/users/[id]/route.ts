import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id, 10);
        
        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const user = await getUserById(userId);
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Don't return password field
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
