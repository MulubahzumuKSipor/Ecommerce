// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RegisterRequestBody {
  username: string;
  email: string;
  phone: string;
  password: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  user?: string | object | null | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequestBody = await req.json();
    const { username, email, phone, password } = body;

    // Validate input
    if (!username || !email || !phone || !password) {
      return NextResponse.json<ApiResponse>({ error: "All fields are required" }, { status: 400 });
    }

    // 1️⃣ Create user in Supabase and send verification email
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/resend`, // redirect after verification
      },
    });

    if (signUpError) {
      return NextResponse.json<ApiResponse>({ error: signUpError.message }, { status: 400 });
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      return NextResponse.json<ApiResponse>({ error: "Failed to create user" }, { status: 500 });
    }

    // 2️⃣ Save user info in PostgreSQL (without password)
    const { rows } = await pool.query(
      `INSERT INTO users (
        username, email, phone, role, status, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [username, email, phone, "user", "pending", userId]
    );

    // 3️⃣ Return success message
    return NextResponse.json<ApiResponse>({
      message: "User registered. Please check your email to verify your account.",
      user: rows[0],
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json<ApiResponse>({ error: message }, { status: 500 });
  }
}
