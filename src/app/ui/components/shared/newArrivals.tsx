// app/components/NewArrivalsList.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import styles from "@/app/ui/styles/product.module.css";
import ProductList from "../products";
import ProductSkeleton from "@/app/ui/skeletons/few_product_skeleton";

interface NewArrivalProduct {
  product_id?: number;
  title?: string;
  brand?: string | null;
  price?: number;
  compare_at_price?: number | null;
  images?: { image_url?: string }[];
  rating?: number | null;
  stock_quantity?: number | null;
  category_name?: string | null;
}

interface NewArrivalsListProps {
  limit?: number;
  title?: string;
}

const NewArrivalsList: React.FC<NewArrivalsListProps> = ({ limit, title = "✨ New Arrivals ✨" }) => {
  const [products, setProducts] = useState<NewArrivalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArrivals = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`/api/products?limit=${limit ?? 10}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Could not load new arrivals. Please check the server.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchArrivals();
  }, [fetchArrivals]);

  if (loading && products.length === 0) {
    return (
      <ProductSkeleton />
    );
  }

  if (error) {
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={40} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.centerMessage} style={{ marginTop: "2rem" }}>
        <h2>No new arrivals yet!</h2>
      </div>
    );
  }

  return (
    <div className={limit ? styles.limitContainer : styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        {limit && <h2 className={styles.heading}>New Arrivals</h2> || <h2>{title}</h2>}
        {limit && (
          <a href="/arrivals" style={{ fontSize: "14px", color: "#3b82f6", textDecoration: "none" }}>
            View All &rarr;
          </a>
        )}
      </div>

      <div className={styles.grid}>
        {products.map((product) =>
          product ? (
            <ProductList
              key={product.product_id ?? Math.random()} // fallback key in case product_id is missing
              product={{
                ...product,
                isNew: true, // NEW badge
              }}
            />
          ) : null
        )}
      </div>
    </div>
  );
};

export default NewArrivalsList;
