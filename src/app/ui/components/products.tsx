"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/app/ui/styles/category.module.css";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";

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

export const API_URL = "http://localhost:3000/api/products";

const ProductList: React.FC<ProductListProps> = ({ limit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const url = new URL(API_URL);
        if (limit) {
          url.searchParams.append("limit", limit.toString());
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        const data: Product[] = Array.isArray(json.products) ? json.products : json;

        setProducts(data);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError("An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

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
      <h1 className={styles.title}>
        {limit ? `Recommended ${limit} Products` : "All Products"}
      </h1>

      {/* This div switches from a CSS Grid (Desktop)
        to a Flexbox Carousel (Mobile) via CSS Media Queries
      */}
      <div className={styles.grid}>
        {products.map((product) => {
          const imageObj = product.images?.[0];
          const defaultDescription = product.description || "No description available.";

          return (
            <div key={product.product_id} className={styles.card}>
              <Link
                href={`/shop/${product.product_id}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div className={styles.imageWrapper}>
                  {imageObj ? (
                    <Image
                      src={imageObj.image_url}
                      alt={product.title}
                      fill
                      className={styles.productImage}
                      /* OPTIMIZATION:
                        Mobile: 85vw (Since card is 85% width)
                        Desktop: Standard grid sizes
                      */
                      sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                </div>
                <div className={styles.content}>
                  <span className={styles.brand}>{product.brand ?? `SKU: ${product.sku}`}</span>
                  <h2 className={styles.productTitle} title={product.title}>{product.title}</h2>
                  <p className={styles.description}>{defaultDescription}</p>

                  <div className={styles.footer}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                    <button
                      className={styles.button}
                      aria-label="Add to cart"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevents clicking the Link when clicking button
                        console.log('Added to cart:', product.title);
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