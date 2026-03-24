import { NextRequest, NextResponse } from 'next/server';
import { registerUser, getUserByEmail } from '@/lib/auth';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, firstName, lastName, phone, address, cardNumber } = await request.json();

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['customer', 'delivery'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Register user
    const user = await registerUser(email, password, role);

    // Create customer or delivery staff profile
    if (role === 'customer') {
      if (!firstName || !phone || !address) {
        return NextResponse.json(
          { error: 'firstName, phone, and address are required for customers' },
          { status: 400 }
        );
      }

      await query(
        'INSERT INTO customers (id, user_id, first_name, last_name, phone, address) VALUES ($1, $2, $3, $4, $5, $6)',
        [crypto.randomUUID(), user.id, firstName, lastName || '', phone, address]
      );
    } else if (role === 'delivery') {
      if (!firstName || !cardNumber) {
        return NextResponse.json(
          { error: 'firstName and cardNumber are required for delivery staff' },
          { status: 400 }
        );
      }

      await query(
        'INSERT INTO delivery_staff (id, user_id, first_name, last_name, card_number, is_verified) VALUES ($1, $2, $3, $4, $5, false)',
        [crypto.randomUUID(), user.id, firstName, lastName || '', cardNumber]
      );
    }

    return NextResponse.json(
      { message: 'User registered successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
