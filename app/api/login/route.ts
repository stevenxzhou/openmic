import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/data";

export async function POST(request: NextRequest) {
    try {
        const loginForm = await request.formData();
        const email = loginForm.get('email') as string;
        const password = loginForm.get('password') as string;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await getUserByEmail(email);
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
        }

        // TODO: Add proper password hashing verification (bcrypt)
        // For now, simple comparison (NOT SECURE - implement bcrypt in production)
        if (user.password !== password) {
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
        
        // Set session cookie with user email (httpOnly for security)
        response.cookies.set('user_session', user.email, {
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