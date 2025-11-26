import { NextResponse } from "next/server";
import pool from "@/lib/db";

// 1. Define the context type with params as a Promise (Next.js 15 requirement)
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 2. You MUST await context.params before accessing properties
    const { id } = await context.params;
    const categoryId = id;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category Id is missing or undefined" },
        { status: 400 }
      );
    }

    // 3. Run your query
    const { rows } = await pool.query(
      `
      SELECT DISTINCT ON (p.id)  -- Ensures only one row per product ID is returned
        p.id,
        p.title,
        p.description,
        p.brand,
        v.price,
        i.image_url
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN product_variants v ON p.id = v.product_id
      LEFT JOIN product_images i ON p.id = i.product_id
      WHERE pc.category_id = $1
      -- Add an ORDER BY to choose which variant/image gets selected first
      ORDER BY p.id, v.price ASC
      `,
      [categoryId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}