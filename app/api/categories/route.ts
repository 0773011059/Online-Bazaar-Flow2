import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neon/serverless';
import { verifySession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const result = await sql`
      SELECT id, name, description
      FROM categories
      ORDER BY name
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[v0] Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, ${description || ''})
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
