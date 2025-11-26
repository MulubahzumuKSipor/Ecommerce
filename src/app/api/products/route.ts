import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');

    let sqlQuery = `
      SELECT
        p.id AS product_id,
        p.title,
        p.description,
        p.brand,
        p.rating,
        v.id AS variant_id,
        v.sku,
        v.price,
        v.compare_at_price,
        v.stock_quantity,
        c.id AS category_id,
        c.name AS category_name,
        json_agg(
          json_build_object(
            'image_url', i.image_url,
            'thumbnail_url', i.thumbnail_url,
            'display_order', i.display_order
          )
          ORDER BY i.display_order
        ) AS images
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      LEFT JOIN product_images i ON i.product_id = p.id
      GROUP BY p.id, v.id, c.id
      ORDER BY p.id DESC
    `;

    // FIX: Use (string | number)[] instead of any[]
    const queryValues: (string | number)[] = [];

    if (limitParam) {
      sqlQuery += ` LIMIT $1`;
      queryValues.push(parseInt(limitParam));
    }

    const { rows } = await pool.query(sqlQuery, queryValues);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}