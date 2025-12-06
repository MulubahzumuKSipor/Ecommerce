"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/top-rated.module.css";
import { ShoppingCart } from "lucide-react";
import AddToCartButton from "./buttons/add-to-cart";

// 1. Define the Props interface
type Props = {
  limit?: number; // Optional: if undefined, shows all
};

type ProductRow = {
  product_id: number;
  title: string;
  description: string;
  brand: string;
  rating: number; 
  variant_id: number;
  sku: string;
  price: string | number;
  compare_at_price: string | number | null;
  stock_quantity: number;
  category_name: string;
  images: {
    image_url: string;
    thumbnail_url: string;
    display_order: number;
  }[];
};

// 2. Accept props in the component
export default function TopRatedProducts({ limit }: Props) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Construct the URL with the limit parameter
        const url = new URL("/api/products", window.location.origin);
        if (limit) {
            url.searchParams.append("limit", limit.toString());
        }

        // Fetch products, now expecting the API to handle the filtering (rating >= 4.0) and limiting
        const res = await fetch(url.toString());
        
        if (!res.ok) throw new Error("Failed to fetch top-rated products");

        const data = await res.json();

        // The API now returns the final, filtered, and limited selection
        setProducts(Array.isArray(data) ? data : []);

      } catch (err) {
        setError("Could not load top-rated products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]); // Re-run if limit changes

  // Helper to render stars (Unchanged)
  const renderStars = (rating: number) => {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const fullStars = Math.floor(r);
    const hasHalf = r % 1 >= 0.5;
    
    return (
      <span className={styles.starContainer} aria-label={`Rating: ${r} out of 5`}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? styles.starFilled : i === fullStars && hasHalf ? styles.starHalf : styles.starEmpty}>
            ★
          </span>
        ))}
        <span className={styles.ratingNumber}>({r.toFixed(1)})</span>
      </span>
    );
  };

  if (loading) return <div className={styles.loader}>Finding top picks...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <section className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className={styles.heading} style={{ marginBottom: 0 }}>
          {limit ? "Top Picks For You" : "All Top Rated Products"}
        </h2>
        
        {/* Optional: Show a "View All" link if we are limiting the view */}
        {limit && (
            <Link href="/bestsellers" style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}>
                View All &rarr;
            </Link>
        )}
      </div>
      
      {products.length === 0 ? (
        <p>No top-rated products found.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => {
            const mainImage = product.images?.[0]?.image_url;
            return (
              <Link 
                key={`${product.product_id}-${product.variant_id}`} 
                href={`/shop/${product.product_id}`}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className={styles.placeholder}>No Image</div>
                  )}
                  <div className={styles.badge}>Top Rated</div>
                </div>

                <div className={styles.details}>
                  <div className={styles.meta}>
                    <span className={styles.category}>{product.category_name || product.brand}</span>
                  </div>
                  <h3 className={styles.title}>{product.title}</h3>
                  <div className={styles.ratingRow}>
                    {renderStars(product.rating)}
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <AddToCartButton productVariantId={product.product_id} quantity={1} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}