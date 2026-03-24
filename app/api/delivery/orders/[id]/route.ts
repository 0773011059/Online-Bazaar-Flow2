import { sql } from '@vercel/postgres';
import { verifyAuth } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);

  if (!auth || auth.role !== 'delivery') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const orderResult = await sql`
      SELECT 
        o.id, 
        o.status, 
        o.total_amount,
        o.created_at,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.phone as customer_phone,
        c.address as customer_address
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ${params.id} AND o.delivery_staff_id = ${auth.userId}
      LIMIT 1
    `;

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    const itemsResult = await sql`
      SELECT 
        oi.id,
        oi.product_id,
        p.name as product_name,
        p.barcode,
        oi.quantity,
        oi.price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${params.id}
    `;

    return NextResponse.json({
      data: {
        ...order,
        customer_name: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim(),
        items: itemsResult.rows.map((item: any) => ({
          ...item,
          scanned: false,
        })),
      },
    });
  } catch (error) {
    console.error('[v0] Error fetching delivery order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);

  if (!auth || auth.role !== 'delivery') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { status } = await request.json();

    await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${params.id} AND delivery_staff_id = ${auth.userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error updating delivery order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
