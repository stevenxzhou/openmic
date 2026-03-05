import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/data";

export async function POST(request: NextRequest) {
    try {
        const signupForm = await request.formData();
        const email = signupForm.get('email') as string;
        const password = signupForm.get('password') as string;
        const first_name = signupForm.get('first_name') as string;
        const last_name = signupForm.get('last_name') as string;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // TODO: Hash password with bcrypt
        const newUser = await createUser({ email, password, first_name, last_name });
        
        const userData = {
            email: newUser.email,
            first_name: newUser.first_name,
            role: "Guest",
            authenticated: true
        };
        
        const response = NextResponse.json(userData, { status: 201 });
        
        // Set session cookie with user email (httpOnly for security)
        response.cookies.set('user_session', email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });
        
        return response;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
