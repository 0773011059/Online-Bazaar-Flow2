import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifySession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    let queryStr = `
      SELECT p.id, p.name, p.price, p.stock_quantity, p.barcode, p.category_id,
             c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = true
    `;

    const params: any[] = [];

    if (categoryId) {
      queryStr += ` AND p.category_id = $${params.length + 1}`;
      params.push(categoryId);
    }

    queryStr += ` ORDER BY c.name, p.name`;

    const result = await query(queryStr, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[v0] Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, price, stock_quantity, barcode, categoryId, description } = await request.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and categoryId are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO products (name, price, stock_quantity, barcode, category_id, description, is_available) VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *',
      [name, price, stock_quantity || 0, barcode || null, categoryId, description || '']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
