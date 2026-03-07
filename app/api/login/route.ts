import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/data";
import bcryptjs from "bcryptjs";
import { createSessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const loginForm = await request.formData();
        const username = loginForm.get('username') as string;
        const password = loginForm.get('password') as string;

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
            email: user.email,
            first_name: user.first_name,
            role: user.role || "Guest",
            authenticated: true
        };
        
        const response = NextResponse.json(userData, { status: 200 });
        
        // Create encrypted session token
        const sessionToken = createSessionToken(user.user_id, user.email);
        response.cookies.set('user_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });
        
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}