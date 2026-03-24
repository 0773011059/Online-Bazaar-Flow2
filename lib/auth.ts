import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from './db';

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Create session token
export function createSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const result = await query(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error fetching user:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    const result = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
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

    const result = await query(
      'INSERT INTO users (id, email, password_hash, role, is_active, created_at) VALUES ($1, $2, $3, $4, true, NOW()) RETURNING id, email, role',
      [userId, email.toLowerCase(), hashedPassword, role]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error registering user:', error);
    throw error;
  }
}

// Get delivery staff info
export async function getDeliveryStaffById(userId: string) {
  try {
    const result = await query(
      'SELECT ds.*, u.email FROM delivery_staff ds JOIN users u ON ds.user_id = u.id WHERE ds.user_id = $1 LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error fetching delivery staff:', error);
    return null;
  }
}

// Get customer info
export async function getCustomerById(userId: string) {
  try {
    const result = await query(
      'SELECT c.*, u.email FROM customers c JOIN users u ON c.user_id = u.id WHERE c.user_id = $1 LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('[v0] Error fetching customer:', error);
    return null;
  }
}
