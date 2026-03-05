import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/data";

export async function POST(request: NextRequest) {
    const loginForm = await request.formData();
    const email = loginForm.get('email') as string;
    const password = loginForm.get('password') as string;

    const rows = await query(
        "SELECT * FROM users WHERE email = ? AND password = ?;",
        [email, password]
    );

    if (rows && rows.length > 0) {
        const {email, role} = rows[0];
        return NextResponse.json({email, role, authenticated:true}, { status: 200 });
    } else {
        return NextResponse.json({}, { status: 401 });
    }
}