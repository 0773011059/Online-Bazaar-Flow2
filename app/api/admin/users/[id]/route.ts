import { sql } from '@vercel/postgres';
import { verifyAdmin } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin(request);

  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await sql`
      DELETE FROM users
      WHERE id = ${params.id} AND role != 'admin'
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
