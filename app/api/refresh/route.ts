import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/data";
import { validateSessionToken, createSessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        // Get encrypted session token from cookie
        const sessionToken = request.cookies.get('user_session')?.value;
        
        if (!sessionToken) {
            return NextResponse.json(
                { error: 'No valid session' },
                { status: 401 }
            );
        }
        
        // Validate and decrypt session token
        const sessionData = validateSessionToken(sessionToken);
        if (!sessionData) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 401 }
            );
        }
        
        // Fetch user data by email
        const user = await getUserByEmail(sessionData.email);
        
        if (!user) {
            // User no longer exists in database
            const response = NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
            // Clear the invalid session cookie
            response.cookies.delete('user_session');
            return response;
        }
        
        // Return user data
        const userData = {
            email: user.email,
            first_name: user.first_name,
            role: user.role || "Guest",
            authenticated: true
        };
        
        const response = NextResponse.json(userData, { status: 200 });
        
        // Refresh the encrypted session token (update expiration)
        const newSessionToken = createSessionToken(user.user_id, user.email);
        response.cookies.set('user_session', newSessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });
        
        return response;
    } catch (error) {
        console.error('Refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
