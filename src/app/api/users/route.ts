import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

// GET all users
export async function GET() {
  try {
    const { rows } = await pool.query("SELECT username, email, phone, role, subscribed FROM users");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST a new user
export async function POST(request: NextRequest) {
  try {
    const { username, email, password, phone } = await request.json();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users(username, email, password, phone, role, subscribed) VALUES($1, $2, $3, $4, $5, $6) RETURNING username, email, phone, role, subscribed",
      [username, email, hashedPassword, phone || null, "user", false]
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
