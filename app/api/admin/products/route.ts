import { pool } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, price, stock_quantity, category_id, description, barcode, is_available } = await req.json();

    if (!name || !price || !stock_quantity || !category_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO products (name, price, stock_quantity, category_id, description, barcode, is_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, price, stock_quantity, category_id, description || '', barcode || null, is_available !== false]
      );

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
