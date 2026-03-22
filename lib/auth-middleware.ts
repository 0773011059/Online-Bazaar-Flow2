import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neon/serverless';

export async function verifySession(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const result = await sql`
      SELECT s.user_id, s.expires_at, u.role, u.is_active
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken}
      AND s.expires_at > NOW()
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];
    if (!session.is_active) {
      return null;
    }

    return {
      userId: session.user_id,
      role: session.role,
      expiresAt: session.expires_at,
    };
  } catch (error) {
    console.error('[v0] Session verification error:', error);
    return null;
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest, context: any) => {
    const session = await verifySession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Add session to request context
    return {
      ...context,
      session,
    };
  };
}

export async function verifyAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const result = await sql`
      SELECT s.user_id, s.expires_at, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken}
      AND s.expires_at > NOW()
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];

    return {
      userId: session.user_id,
      role: session.role,
      expiresAt: session.expires_at,
    };
  } catch (error) {
    console.error('[v0] Auth verification error:', error);
    return null;
  }
}

export async function verifyAdmin(request: NextRequest) {
  const auth = await verifyAuth(request);
  
  if (!auth || auth.role !== 'admin') {
    return null;
  }

  return auth;
}
