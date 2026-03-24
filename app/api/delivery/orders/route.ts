import { sql } from '@vercel/postgres';
import { verifyAuth } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);

  if (!auth || auth.role !== 'delivery') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await sql`
      SELECT 
        o.id, 
        o.status, 
        o.total_amount,
        o.created_at,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.phone as customer_phone,
        c.address as customer_address,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.delivery_staff_id = ${auth.userId}
      ORDER BY o.created_at DESC
    `;

    const orders = result.rows.map((row: any) => ({
      ...row,
      customer_name: `${row.customer_first_name || ''} ${row.customer_last_name || ''}`.trim(),
    }));

    return NextResponse.json({
      data: orders,
    });
  } catch (error) {
    console.error('[v0] Error fetching delivery orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
