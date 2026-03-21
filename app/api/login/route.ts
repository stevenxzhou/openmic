import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/data";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const username = body.username as string;
        const password = body.password as string;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        const user = await getUserByUsername(username);
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
        }

        // Verify password with bcrypt
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Create session response
        const userData = {
            id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            role: user.role || "Guest"
        };
        
        const response = NextResponse.json(userData, { status: 200 });
        
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}