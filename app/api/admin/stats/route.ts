import { pool } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const totalOrdersRes = await client.query('SELECT COUNT(*) FROM orders');
      const pendingOrdersRes = await client.query(
        "SELECT COUNT(*) FROM orders WHERE status = 'pending'"
      );
      const totalCustomersRes = await client.query('SELECT COUNT(*) FROM customers');
      const totalDeliveryStaffRes = await client.query(
        'SELECT COUNT(*) FROM delivery_staff WHERE is_active = true'
      );
      const totalProductsRes = await client.query('SELECT COUNT(*) FROM products');

      return NextResponse.json({
        totalOrders: parseInt(totalOrdersRes.rows[0].count),
        pendingOrders: parseInt(pendingOrdersRes.rows[0].count),
        totalCustomers: parseInt(totalCustomersRes.rows[0].count),
        totalDeliveryStaff: parseInt(totalDeliveryStaffRes.rows[0].count),
        totalProducts: parseInt(totalProductsRes.rows[0].count)
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
