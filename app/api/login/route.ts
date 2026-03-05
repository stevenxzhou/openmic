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

        // TODO: Create proper session/JWT token
        const userData = { id: user.user_id, email: user.email, first_name: user.first_name, last_name: user.last_name, authenticated: true };
        return NextResponse.json(userData, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}