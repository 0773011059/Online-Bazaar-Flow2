import { sql } from '@vercel/postgres';
import { verifyAdmin } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);

  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await sql`
      SELECT id, email, first_name, last_name, phone, card_number, is_active, created_at
      FROM users
      WHERE role = 'delivery'
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      data: result.rows,
    });
  } catch (error) {
    console.error('[v0] Error fetching delivery staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery staff' },
      { status: 500 }
    );
  }
}
