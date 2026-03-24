import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'SELECT id, first_name, last_name, phone_number FROM delivery_staff WHERE is_active = true ORDER BY first_name'
      );
      return NextResponse.json(res.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching delivery staff:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery staff' }, { status: 500 });
  }
}
