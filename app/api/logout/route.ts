import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const res = NextResponse.json({ authenticated: false }, { status: 200 });
        // Clear the user session cookie
        res.cookies.delete('user_session');
        return res;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}