// app/api/best-sellers/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db"; 

// Define limits
const BEST_SELLERS_COUNT = 10;
const TOTAL_PRODUCTS_TO_RETURN = 15; // Target list size

export async function GET() {
  try {
    const { rows } = await pool.query(
      `
      -- 1. CTE: Summarizes sales count, stock, and price for ALL products
      WITH ProductSummary AS (
          SELECT
              p.id AS product_id,
              p.title,
              p.description,
              p.brand,
              -- Total historical sales count
              COALESCE(SUM(oi.quantity), 0) AS total_sold,
              -- Total current stock across all variants
              COALESCE(SUM(pv.stock_quantity), 0) AS total_stock,
              -- Lowest current price
              MIN(pv.price) AS min_price
          FROM products p
          LEFT JOIN product_variants pv ON p.id = pv.product_id
          -- Assumes 'order_items' links to 'product_variants'
          LEFT JOIN order_items oi ON pv.id = oi.product_variant_id
          GROUP BY p.id, p.title, p.description, p.brand
      ),
      
      -- 2. CTE: Selects the Top Best Sellers
      TopSellers AS (
          SELECT
              ps.product_id,
              ps.title,
              ps.description,
              ps.brand,
              ps.min_price AS price,
              ps.total_stock,
              ps.total_sold,
              'BEST_SELLER' AS type -- Tag the product type
          FROM ProductSummary ps
          WHERE ps.total_sold > 0
          ORDER BY ps.total_sold DESC
          LIMIT $1
      ),
      
      -- 3. CTE: Selects Low Stock Fallback items that ARE NOT already Best Sellers
      LowStockFallback AS (
          SELECT
              ps.product_id,
              ps.title,
              ps.description,
              ps.brand,
              ps.min_price AS price,
              ps.total_stock,
              ps.total_sold,
              'LOW_STOCK' AS type -- Tag the product type
          FROM ProductSummary ps
          WHERE 
              ps.total_stock < 20
              AND ps.product_id NOT IN (SELECT product_id FROM TopSellers)
          ORDER BY ps.total_stock ASC -- Order by lowest stock first
          LIMIT $2
      )

      -- 4. Final UNION Query: Combine Top Sellers and Fallback, then limit the total
      (SELECT * FROM TopSellers)
      UNION
      (SELECT * FROM LowStockFallback)
      
      LIMIT $3;
      `,
      [BEST_SELLERS_COUNT, TOTAL_PRODUCTS_TO_RETURN, TOTAL_PRODUCTS_TO_RETURN]
    );

    // Now, join the aggregated data with the image
    const productIds = rows.map(r => r.product_id);

    if (productIds.length === 0) {
        return NextResponse.json({ message: "No best sellers or low stock products available." }, { status: 200 });
    }

    // Since we need the image outside the main query due to complexity, we fetch it separately.
    const imageQuery = await pool.query(
        `
        SELECT 
            DISTINCT ON (product_id)
            product_id, 
            image_url
        FROM product_images
        WHERE product_id = ANY($1::int[])
        ORDER BY product_id, id ASC;
        `,
        [productIds]
    );

    const imageMap = new Map(imageQuery.rows.map(img => [img.product_id, img.image_url]));

    const result = rows.map(product => ({
        ...product,
        image_url: imageMap.get(product.product_id) || null
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Best Sellers API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while fetching best sellers." },
      { status: 500 }
    );
  }
}