import { pool } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT o.id, o.customer_id, o.status, o.total_price, o.delivery_fee, o.created_at, 
         o.delivery_staff_id, c.full_name, c.phone_number
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         WHERE o.status = $1
         ORDER BY o.created_at DESC`,
        [status]
      );

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
