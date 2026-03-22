import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, delivery_staff_id, delivery_fee, notes, address, phone_number } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get customer ID
      const customerRes = await client.query(
        'SELECT id FROM customers WHERE user_id = $1',
        [auth.userId]
      );

      if (customerRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Customer profile not found' }, { status: 400 });
      }

      const customerId = customerRes.rows[0].id;

      // Update customer address and phone if provided
      if (address || phone_number) {
        await client.query(
          'UPDATE customers SET address = COALESCE($1, address), phone_number = COALESCE($2, phone_number) WHERE id = $3',
          [address, phone_number, customerId]
        );
      }

      // Calculate total price
      let totalPrice = 0;
      for (const item of items) {
        const productRes = await client.query(
          'SELECT price FROM products WHERE id = $1',
          [item.product_id]
        );
        if (productRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
        }
        totalPrice += productRes.rows[0].price * item.quantity;
      }

      // Create order
      const orderRes = await client.query(
        'INSERT INTO orders (customer_id, delivery_staff_id, status, total_price, delivery_fee, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [customerId, delivery_staff_id || null, 'pending', totalPrice, delivery_fee || 0, notes || '']
      );

      const orderId = orderRes.rows[0].id;

      // Insert order items
      for (const item of items) {
        const productRes = await client.query(
          'SELECT price FROM products WHERE id = $1',
          [item.product_id]
        );
        const priceAtTime = productRes.rows[0].price;

        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, priceAtTime]
        );

        // Reduce stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        orderId,
        totalPrice,
        deliveryFee: delivery_fee || 0,
        message: 'Order created successfully. Waiting for admin approval.'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const ordersRes = await client.query(
        `SELECT o.*, c.id as customer_id, ds.first_name, ds.last_name
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         LEFT JOIN delivery_staff ds ON o.delivery_staff_id = ds.id
         WHERE c.user_id = $1
         ORDER BY o.created_at DESC`,
        [auth.userId]
      );

      const ordersWithItems = await Promise.all(
        ordersRes.rows.map(async (order) => {
          const itemsRes = await client.query(
            `SELECT oi.*, p.name, p.barcode FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [order.id]
          );
          return { ...order, items: itemsRes.rows };
        })
      );

      return NextResponse.json(ordersWithItems);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
