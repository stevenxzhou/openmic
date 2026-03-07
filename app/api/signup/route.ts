import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserByUsername, createUser } from "@/lib/data";
import bcryptjs from "bcryptjs";
import { createSessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const signupForm = await request.formData();
        const username = signupForm.get('username') as string;
        const email = signupForm.get('email') as string;
        const password = signupForm.get('password') as string;
        const first_name = signupForm.get('first_name') as string;
        const last_name = signupForm.get('last_name') as string;

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Username, email and password are required' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUsername = await getUserByUsername(username);
        if (existingUsername) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Check if email already exists
        const existingEmail = await getUserByEmail(email);
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Hash password with bcrypt
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = await createUser({ username, email, password: hashedPassword, first_name, last_name });
        
        const userData = {
            email: newUser.email,
            first_name: newUser.first_name,
            role: "Guest",
            authenticated: true
        };
        
        const response = NextResponse.json(userData, { status: 201 });
        
        // Create encrypted session token
        const sessionToken = createSessionToken(newUser.user_id, email);
        response.cookies.set('user_session', sessionToken, {
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
