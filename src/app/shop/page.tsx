"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import ProductList from "@/app/ui/components/products"; // Product card component
import styles from "@/app/ui/styles/product.module.css";

interface Product {
  product_id?: number;
  title?: string;
  brand?: string | null;
  price?: number | string | null;
  compare_at_price?: number | string | null;
  images?: { image_url?: string | null }[] | null;
  rating?: number | null;
  stock_quantity?: number | null;
  category_name?: string | null;
  isNew?: boolean; // optional: mark new products
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch all products from the API
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch products: HTTP ${res.status}`);

        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Products fetch error:", err);
        setError("Could not load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <Loader2 className="animate-spin" size={40} color="#1ab26e" />
        <p>Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>All Products</h1>
        <div className={styles.centerMessage}>
          <h2>No products available</h2>
          <p>Check back later or ensure your product feed is populated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>All Products</h1>
      <div className={styles.grid}>
        {products.map((p) => (
          <ProductList
            key={p.product_id ?? `${p.title}-${Math.random().toString(36).slice(2, 9)}`}
            product={{ ...p }}
          />
        ))}
      </div>
    </div>
  );
}
