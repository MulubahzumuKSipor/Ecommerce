"use client";

import { useEffect, useState } from "react";
import ProductList from "../components/products";
import { AlertCircle } from "lucide-react";
import ProductSkeleton from "../skeletons/few_product_skeleton";
import styles from "@/app/ui/styles/product.module.css";

export interface Product {
  product_id?: number;
  title?: string;
  brand?: string | null;
  price?: number | string | null;
  compare_at_price?: number | string | null;
  images?: { image_url?: string | null }[] | null;
  rating?: number | null;
  stock_quantity?: number | null;
  category_name?: string | null;
  isNew?: boolean;
  isTopRated?: boolean;
}

interface ProductsGridProps {
  limit?: number; // optional
}

// Fisher–Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const ProductsGrid: React.FC<ProductsGridProps> = ({ limit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch products: HTTP ${res.status}`);

        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return (
      <ProductSkeleton />
    );

  if (error)
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );

  // Shuffle products and slice if limit is provided
  const displayedProducts = limit ? shuffleArray(products).slice(0, limit) : products;

  if (!displayedProducts.length)
    return (
      <div className={styles.centerMessage}>
        <p>No products available.</p>
      </div>
    );

  return (
    <div
      className={`${styles.container} ${limit ? styles.limitContainer : ""}`}
    >
      {/* Show heading only if limit is provided */}
      {limit && <h2 className={styles.heading}>Recommended Products</h2>}

      <div className={styles.grid}>
        {displayedProducts.map((product) => (
          <ProductList
            key={product.product_id ?? `${product.title}-${Math.random().toString(36).slice(2, 9)}`}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsGrid;
