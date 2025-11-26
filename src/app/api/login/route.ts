import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface User {
  id: number;
  email: string;
  password_hash: string;
  username: string;
  phone: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  if (!JWT_SECRET) {
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    const userResult = await pool.query<User>(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid Password and Email." }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return NextResponse.json({
      message: "Login successful.",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
