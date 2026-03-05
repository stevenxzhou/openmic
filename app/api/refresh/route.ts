import { NextRequest, NextResponse } from "next/server";

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';

export async function POST(request: NextRequest) {
    try {
        const response = await fetch(`${openmicApiBase}/api/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Cookie': request.headers.get('cookie') || ''
            }
        });
        
        if (!response.ok) {
            return NextResponse.json(
                { error: 'Refresh failed' },
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
        console.error('Refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
