import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, username, phone } = body;

  if (!email || !password || !username || !phone) {
    return NextResponse.json({ message: 'All fields required.' }, { status: 400 });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET missing");
    return NextResponse.json({ message: 'Server misconfiguration.' }, { status: 500 });
  }

  try {
    // Check existing user
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, username',
      [username, email, passwordHash, phone]
    );

    const user = newUser.rows[0];

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    return NextResponse.json({ message: 'User created.', user: { id: user.id, email: user.email }, token }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
