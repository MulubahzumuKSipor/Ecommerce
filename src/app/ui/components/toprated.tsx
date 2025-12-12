// app/components/TopRatedProductsList.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import styles from "@/app/ui/styles/product.module.css";
import ProductList from "../components/products";
import ProductSkeleton from "@/app/ui/skeletons/few_product_skeleton";

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
}

interface TopRatedProductsListProps {
  limit?: number;
  title?: string;
}

const TopRatedProductsList: React.FC<TopRatedProductsListProps> = ({ limit, title = "⭐ Top Rated Products ⭐" }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopRated = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`/api/products?limit=${limit ?? 20}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Product[] = await res.json();
      const topRated = data.filter((p) => (p.rating ?? 0) > 4.5); // filter ratings above 4.5
      setProducts(topRated);
    } catch (err) {
      console.error(err);
      setError("Could not load top-rated products. Please check the server.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopRated();
  }, [fetchTopRated]);

  if (loading && products.length === 0) return <ProductSkeleton />;

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
        <h2>No top-rated products yet!</h2>
      </div>
    );
  }

  return (
    <div className={limit ? styles.limitContainer : styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 className={styles.heading}>{title}</h2>
        {limit && (
          <a href="/top-rated" style={{ fontSize: "14px", color: "#3b82f6", textDecoration: "none" }}>
            View All &rarr;
          </a>
        )}
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductList
            key={product.product_id ?? Math.random()}
            product={{
              ...product,
              isTopRated: true, // highlight top-rated
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TopRatedProductsList;
