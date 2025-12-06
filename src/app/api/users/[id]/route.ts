// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params; // unwrap the promise
  if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      "SELECT username, email, role, status FROM users WHERE user_id = $1",
      [userId]
    );

    if (!rows.length) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user: rows[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
