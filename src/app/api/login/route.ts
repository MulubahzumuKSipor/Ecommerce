import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // 1️⃣ Authenticate via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user?.email_confirmed_at) {
      return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
    }

    const userId = data.user.id;

    // 2️⃣ Fetch user info from PostgreSQL
    const { rows } = await pool.query("SELECT id, username, email, phone, role, status, created_at, updated_at, user_id FROM users WHERE user_id = $1", [userId]);
    if (!rows.length) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const user = rows[0];

    return NextResponse.json({
      message: "Login successful.",
      user,
      access_token: data.session?.access_token
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err || "Server error" }, { status: 500 });
  }
}
