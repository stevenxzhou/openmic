import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/data";

export async function POST(request: NextRequest) {
    try {
        // Get user email from session cookie
        const userEmail = request.cookies.get('user_session')?.value;
        
        if (!userEmail) {
            return NextResponse.json(
                { error: 'No valid session' },
                { status: 401 }
            );
        }
        
        // Fetch user data by email
        const user = await getUserByEmail(userEmail);
        
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
        
        return NextResponse.json(userData, { status: 200 });
    } catch (error) {
        console.error('Refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
