import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // Assuming this correctly imports your PostgreSQL connection pool

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const categoryIdParam = searchParams.get('category_id');

    // Array to hold the values for the parameterized query
    const queryValues: (string | number)[] = [];
    let paramIndex = 1;

    // Build WHERE clauses array
    const whereClauses: string[] = [];

    // FIX: Explicitly cast p.rating to NUMERIC because it is stored as character varying (text)
    // and cannot be compared directly to the numeric literal 4.0.
    whereClauses.push(`CAST(p.rating AS NUMERIC) >= 4.0`);

    // Add Category Filter
    if (categoryIdParam) {
      whereClauses.push(`c.id = $${paramIndex}`);
      queryValues.push(categoryIdParam);
      paramIndex++;
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";


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
        c.categories_images AS categories_images,
        json_agg(
          jsonb_build_object(
            'image_url', i.image_url,
            'thumbnail_url', i.thumbnail_url,
            'display_order', i.display_order
          )
          ORDER BY i.display_order
        ) FILTER (WHERE i.image_url IS NOT NULL) AS images
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      LEFT JOIN product_images i ON i.product_id = p.id
      ${whereSql}
      GROUP BY p.id, v.id, c.id
      ORDER BY CAST(p.rating AS NUMERIC) DESC, p.id DESC
    `;
    // NOTE: Also applying CAST to p.rating in the ORDER BY clause to ensure numeric sorting.

    // --- Add LIMIT clause ---
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        sqlQuery += ` LIMIT $${paramIndex}`;
        queryValues.push(parsedLimit);
      }
    }

    const { rows } = await pool.query(sqlQuery, queryValues);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}