// /api/orders/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { supabase } from "@/lib/client";

export async function GET(req: NextRequest, context: { params: { userId: string } }) {
  try {
    const { userId } = context.params;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify user with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Fetch all orders for this user
    const { rows: orders } = await pool.query(
      `SELECT order_id, total_amount, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    if (!orders.length) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    // 4️⃣ Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { rows: items } = await pool.query(
          `SELECT p.name AS product_name, oi.quantity, oi.price
           FROM order_items oi
           JOIN products p ON oi.product_id = p.product_id
           WHERE oi.order_id = $1`,
          [order.order_id]
        );
        return { ...order, items };
      })
    );

    return NextResponse.json({ orders: ordersWithItems }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/orders/[userId]] error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
