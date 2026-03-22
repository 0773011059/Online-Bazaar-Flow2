import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-middleware';
import { getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('[v0] Error checking auth:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication' },
      { status: 500 }
    );
  }
}
