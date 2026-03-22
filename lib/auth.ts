import { sql } from '@neon/serverless';
import crypto from 'crypto';

// Hash password using bcrypt (simple implementation)
export async function hashPassword(password: string): Promise<string> {
  // For production, use proper bcrypt library
  // This is a simplified version for demonstration
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

// Create session token
export function createSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, password_hash, role, is_active
      FROM users
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error fetching user:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    const result = await sql`
      SELECT id, email, role, is_active
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error fetching user by ID:', error);
    return null;
  }
}

// Register user
export async function registerUser(email: string, password: string, role: 'customer' | 'delivery' | 'admin') {
  try {
    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    const result = await sql`
      INSERT INTO users (id, email, password_hash, role, is_active, created_at)
      VALUES (${userId}, ${email.toLowerCase()}, ${hashedPassword}, ${role}, true, NOW())
      RETURNING id, email, role
    `;

    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error registering user:', error);
    throw error;
  }
}

// Get delivery staff info
export async function getDeliveryStaffById(userId: string) {
  try {
    const result = await sql`
      SELECT ds.*, u.email
      FROM delivery_staff ds
      JOIN users u ON ds.user_id = u.id
      WHERE ds.user_id = ${userId}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error fetching delivery staff:', error);
    return null;
  }
}

// Get customer info
export async function getCustomerById(userId: string) {
  try {
    const result = await sql`
      SELECT c.*, u.email
      FROM customers c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ${userId}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error fetching customer:', error);
    return null;
  }
}
