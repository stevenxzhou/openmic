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
        
        const userData = { id: newUser.user_id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, authenticated: true };
        return NextResponse.json(userData, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
