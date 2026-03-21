import { NextRequest, NextResponse } from 'next/server';
import { createUserIfValid } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, instagram, email, firstName, lastName } = body;

    if (
      !username || typeof username !== 'string' ||
      !email || typeof email !== 'string' ||
      !firstName || typeof firstName !== 'string' ||
      !lastName || typeof lastName !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const result = await createUserIfValid(username, email, firstName, lastName, instagram);

    if (result.success) {
      // Optionally set session here
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
