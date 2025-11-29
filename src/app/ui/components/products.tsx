"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/styles/category.module.css";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";

// ---------------------------------------------------------------
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
// ---------------------------------------------------------------

interface Product {
  product_id: number;
  title: string;
  brand: string | null;
  sku: string | null;
  description: string | null;
  price: number | string | null;
  stock_quantity: number | null;
  rating: number | null;
  variants: unknown[] | null;
  images: Array<{ image_url: string }> | null;
  categories: Array<{ name: string }> | null;
}

interface ProductListProps {
  limit?: number;
}

// ✅ FIX: Use a relative path constant instead of the absolute URL.
// This resolves the CORS/Origin mismatch when accessing the app via IP (192.168.x.x).
const PRODUCTS_API_PATH = "/api/products";

const ProductList: React.FC<ProductListProps> = ({ limit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // 1. Fetch the full list
        // The browser automatically prepends the correct host (localhost or 192.168.x.x)
        const url = PRODUCTS_API_PATH;

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        const allProducts: Product[] = Array.isArray(json.products)
          ? json.products
          : json;

        let finalProducts = allProducts;

        // 2. If a limit is set, shuffle and slice the products array
        if (limit) {
          const shuffledProducts = shuffleArray(allProducts);
          finalProducts = shuffledProducts.slice(0, limit);
        }

        setProducts(finalProducts);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError("An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  // --- Rendering Logic ---

  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <Loader2 className="animate-spin" size={40} color="#2563eb" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>Error fetching data: {error}</p>
      </div>
    );
  }

  const formatPrice = (price: number | string | null) => {
    if (price === null || isNaN(Number(price))) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 className={styles.heading} style={{ marginBottom: 0 }}>
          {limit ? "Recommended For You" : "Recommended Products"}
        </h2>

        {/* Optional: Show a "View All" link if we are limiting the view */}
        {limit && (
          <Link
            href="/shop"
            style={{
              fontSize: "14px",
              color: "#3b82f6",
              textDecoration: "none",
            }}
          >
            View All &rarr;
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {products.map((product) => {
          const imageObj = product.images?.[0];
          const defaultDescription = product.description || "No description available.";

          return (
            <div key={product.product_id} className={styles.card}>
              <Link
                href={`/shop/${product.product_id}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div className={styles.imageWrapper}>
                  {imageObj ? (
                    <Image
                      src={imageObj.image_url}
                      alt={product.title}
                      fill
                      className={styles.productImage}
                      sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                </div>
                <div className={styles.content}>
                  <span className={styles.brand}>
                    {product.brand ?? `SKU: ${product.sku}`}
                  </span>
                  <h2 className={styles.productTitle} title={product.title}>
                    {product.title}
                  </h2>
                  <p className={styles.description}>{defaultDescription}</p>

                  <div className={styles.footer}>
                    <span className={styles.price}>
                      {formatPrice(product.price)}
                    </span>
                    <button
                      className={styles.button}
                      aria-label="Add to cart"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevents clicking the Link when clicking button
                        console.log("Added to cart:", product.title);
                      }}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;