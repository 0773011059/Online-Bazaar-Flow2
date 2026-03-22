import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neon/serverless';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;

    if (sessionToken) {
      // Delete session from database
      await sql`
        DELETE FROM sessions
        WHERE token = ${sessionToken}
      `;
    }

    // Clear cookie
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    response.cookies.delete('sessionToken');

    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
