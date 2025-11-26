// app/api/specials/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Assuming your database connection pool is here

// Define the threshold for low stock
const LOW_STOCK_THRESHOLD = 20;
// Define the number of specials to display
const SPECIALS_LIMIT = 5;

export async function GET() {
  try {
    // This query selects products with stock < 20, orders them randomly, 
    // and limits the result to 5.
    const { rows } = await pool.query(
      `
    WITH ProductSummary AS (
        SELECT
            p.id AS product_id,
            p.title,
            p.description,
            p.brand,
            -- Calculate Total Stock by summing stock_quantity from all variants
            COALESCE(SUM(pv.stock_quantity), 0) AS total_stock,

            -- Find the lowest price among all variants for display
            MIN(pv.price) AS min_price
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        GROUP BY p.id, p.title, p.description, p.brand
    )
    SELECT
        ps.product_id,
        ps.title,
        ps.description,
        ps.brand,
        ps.total_stock AS stock_quantity, -- Rename total_stock for frontend compatibility
        ps.min_price AS price,
        i.image_url
    FROM ProductSummary ps
    -- Join to get the SINGLE image using DISTINCT ON based on the image's ID
    LEFT JOIN (
        SELECT
            DISTINCT ON (product_id)
            product_id,
            image_url
        FROM product_images
        ORDER BY product_id, id ASC -- Selects the image with the lowest (oldest) ID
    ) i ON ps.product_id = i.product_id
    WHERE
        ps.total_stock < $1
    ORDER BY
        RANDOM()
    LIMIT $2;
      `,
      [LOW_STOCK_THRESHOLD, SPECIALS_LIMIT]
    );

    if (rows.length === 0) {
      // If no products meet the low stock criteria
      return NextResponse.json({ message: "No current specials available." }, { status: 200 });
    }

    // You might want to apply a discount here before returning, 
    // e.g., rows.map(row => ({...row, sale_price: row.price * 0.8}))

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Specials API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while fetching specials." },
      { status: 500 }
    );
  }
}