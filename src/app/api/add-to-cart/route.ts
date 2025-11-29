// app/api/cart-items/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface CartItem {
  product_variant_id: number;
  quantity: number;
}

// Helper: Get user ID from request headers/cookies (adjust as per your auth)
function getUserId(req: NextRequest) {
  // Example: if you pass user_id in headers after login
  const userId = req.headers.get("x-user-id");
  return userId ? parseInt(userId) : null;
}

// Helper: Get session ID for guests
function getSessionId(req: NextRequest) {
  const sessionId = req.cookies.get("session_id")?.value;
  return sessionId || null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const sessionId = getSessionId(req);

    let query = "";
    const values: (string | number)[] = [];

    if (userId) {
      query = `
        SELECT ci.*, v.price, v.sku, p.title
        FROM cart_items ci
        JOIN product_variants v ON ci.product_variant_id = v.id
        JOIN products p ON v.product_id = p.id
        WHERE ci.user_id = $1
      `;
      values.push(userId);
    } else if (sessionId) {
      query = `
        SELECT ci.*, v.price, v.sku, p.title
        FROM cart_items ci
        JOIN product_variants v ON ci.product_variant_id = v.id
        JOIN products p ON v.product_id = p.id
        WHERE ci.session_id = $1
      `;
      values.push(sessionId);
    } else {
      return NextResponse.json([]);
    }

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const sessionId = getSessionId(req);
    const body: CartItem = await req.json();

    if (!body.product_variant_id || !body.quantity) {
      return NextResponse.json({ error: "Missing product_variant_id or quantity" }, { status: 400 });
    }

    if (userId) {
      // Logged-in: Insert or update existing cart item
      const upsertQuery = `
        INSERT INTO cart_items (user_id, product_variant_id, quantity, added_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (user_id, product_variant_id)
        DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
        RETURNING *
      `;
      const { rows } = await pool.query(upsertQuery, [userId, body.product_variant_id, body.quantity]);
      return NextResponse.json(rows[0]);
    } else {
      // Guest: Store in DB with session_id
      const guestQuery = `
        INSERT INTO cart_items (session_id, product_variant_id, quantity, added_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (session_id, product_variant_id)
        DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
        RETURNING *
      `;
      const { rows } = await pool.query(guestQuery, [sessionId, body.product_variant_id, body.quantity]);
      return NextResponse.json(rows[0]);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}
