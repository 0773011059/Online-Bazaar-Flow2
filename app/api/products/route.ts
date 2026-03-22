import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neon/serverless';
import { verifySession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    let query = `
      SELECT p.id, p.name, p.price, p.quantity, p.barcode, p.category_id,
             c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = true
    `;

    const params: any[] = [];

    if (categoryId) {
      query += ` AND p.category_id = $${params.length + 1}`;
      params.push(categoryId);
    }

    query += ` ORDER BY c.name, p.name`;

    const result = await sql(query, params);

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

    const { name, price, quantity, barcode, categoryId, description } = await request.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and categoryId are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO products (name, price, quantity, barcode, category_id, description, is_available)
      VALUES (${name}, ${price}, ${quantity || 0}, ${barcode || null}, ${categoryId}, ${description || ''}, true)
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
