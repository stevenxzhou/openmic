import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // TODO: Invalidate session/token
        const res = NextResponse.json({ authenticated: false }, { status: 200 });
        // Clear auth cookie if using cookies
        res.cookies.delete('auth');
        return res;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}