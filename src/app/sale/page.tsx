"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";
import styles from "@/app/ui/styles/product.module.css";
import AddToCartButton from "../ui/components/buttons/add-to-cart";
import BestSellersSkeleton from "../ui/skeletons/product_skeleton";

// Interface for product
interface BestSellerProduct {
  product_id: number;
  title: string;
  description: string;
  brand: string | null;
  price: number | string | null;
  total_stock: number;
  total_sold: number;
  type: "BEST_SELLER" | "LOW_STOCK";
  image_url: [] | string | null;
}

export default function BestSellersPage() {
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");

        if (!res.ok) throw new Error(`Failed to fetch best sellers: ${res.status}`);

        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load products. Please check the API endpoint.");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const formatPrice = (price: number | string | null) => {
    if (price === null || isNaN(Number(price))) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price));
  };

  const renderTag = (product: BestSellerProduct) => {
    if (product.type === "BEST_SELLER") {
      return (
        <div className={`${styles.statusTag} ${styles.bestSellerTag}`}>
          <TrendingUp size={14} style={{ marginRight: 4 }} /> BEST SELLER
        </div>
      );
    }
    if (product.type === "LOW_STOCK") {
      return (
        <div className={`${styles.statusTag} ${styles.lowStockTag}`}>
          <AlertTriangle size={14} style={{ marginRight: 4 }} /> LOW STOCK
        </div>
      );
    }
    return null;
  };

  // --- Loading state ---
  if (loading) return <BestSellersSkeleton />;

  // --- Error state ---
  if (error) {
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  // --- Empty state ---
  if (products.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>🏆 Top Sellers 🏆</h1>
        <div className={styles.centerMessage}>
          <h2>No products available</h2>
          <p>Check back later or ensure the product feed is populated.</p>
        </div>
      </div>
    );
  }

  // --- Main product grid ---
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Trending</h1>
      <div className={styles.grid}>
        {products.map((product) => (
          <div key={product.product_id} className={styles.card}>
            <Link href={`/shop/${product.product_id}`} className={styles.link}>
              <div className={styles.imageWrapper}>
                {renderTag(product)}
                {product.image_url ? (
                  <Image
                    src={product.image_url[0]}
                    alt={product.title}
                    fill
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
              </div>

              <div className={styles.content}>
                <span className={styles.brand}>{product.brand ?? "Popular"}</span>
                <h2 className={styles.title}>{product.title}</h2>
                <p className={styles.description}>
                  {product.description?.slice(0, 100) ?? "Check out this top product!"}...
                </p>

                {product.type === "LOW_STOCK" && (
                  <div className={styles.lowStockText}>Only {product.total_stock} left!</div>
                )}

                <div className={styles.footer}>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                  <AddToCartButton productVariantId={product.product_id} quantity={1} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
