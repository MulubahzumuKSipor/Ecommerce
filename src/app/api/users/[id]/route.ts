import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { authMiddleware } from "@/lib/middleware";
import type { User } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  context: { params: { userId: string } } // still plain object for your code
) {
  try {
    const authResult = await authMiddleware(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const authUser: User = authResult;
    const { userId } = context.params; // no await

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (authUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `
      SELECT * FROM orders
      WHERE user_id = $1
    `,
      [userId]
    );

    return NextResponse.json({ orders: rows || [] }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/orders/[userId]] error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
