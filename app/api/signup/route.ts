import { NextRequest, NextResponse } from "next/server";

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';

export async function POST(request: NextRequest) {
    try {
        const signupForm = await request.formData();
        const email = signupForm.get('email') as string;
        const password = signupForm.get('password') as string;
        const first_name = signupForm.get('first_name') as string;
        const last_name = signupForm.get('last_name') as string;

        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);

        const response = await fetch(`${openmicApiBase}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
            credentials: 'include'
        });
        
        if (!response.ok) {
            return NextResponse.json(
                { error: 'Signup failed' },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        
        // Forward cookies from backend to client
        const setCookieHeader = response.headers.get('set-cookie');
        const res = NextResponse.json(data, { status: 200 });
        
        if (setCookieHeader) {
            res.headers.set('set-cookie', setCookieHeader);
        }
        
        return res;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
