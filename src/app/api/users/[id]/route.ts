import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { authMiddleware } from "@/lib/middleware";
import type { User } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(req);

    // If middleware returned an error response, return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const authUser: User = authResult;
    const { id: userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (authUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `
      SELECT username, email, phone, role, subscribed
      FROM users
      WHERE user_id = $1
    `,
      [userId]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/users/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
