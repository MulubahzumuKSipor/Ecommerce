// app/api/new-arrivals/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Define a default limit in case the query parameter is not provided or is invalid
const DEFAULT_ARRIVALS_LIMIT = 20;
// Define a maximum limit to prevent excessively large queries
const MAX_ARRIVALS_LIMIT = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");

    // 1. Determine the limit:
    let limit = DEFAULT_ARRIVALS_LIMIT;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        // Apply the maximum limit constraint
        limit = Math.min(parsedLimit, MAX_ARRIVALS_LIMIT);
      }
    }

    // We will use the CTE structure again to ensure correct price and image de-duplication
    const { rows } = await pool.query(
      `
      WITH ProductDetails AS (
          SELECT
              p.id AS product_id,
              p.title,
              p.description,
              p.brand,
              p.created_at,  -- Important for sorting
              
              -- Find the lowest price among all variants for display
              MIN(pv.price) AS min_price
          FROM products p
          LEFT JOIN product_variants pv ON p.id = pv.product_id
          GROUP BY p.id, p.title, p.description, p.brand, p.created_at
      )
      SELECT
          pd.product_id,
          pd.title,
          pd.description,
          pd.brand,
          pd.min_price AS price,
          i.image_url
      FROM ProductDetails pd
      -- Join to get the SINGLE primary image
      LEFT JOIN (
          SELECT 
              DISTINCT ON (product_id)
              product_id, 
              image_url
          FROM product_images
          ORDER BY product_id, id ASC 
      ) i ON pd.product_id = i.product_id
      
      -- Sort by creation date descending to get the newest items
      ORDER BY pd.created_at DESC
      LIMIT $1;
      `,
      [limit] // Use the determined 'limit' variable here
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "No new arrivals available." }, { status: 200 });
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("New Arrivals API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while fetching new arrivals." },
      { status: 500 }
    );
  }
}