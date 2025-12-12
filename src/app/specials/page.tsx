"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import AddToCartButton from "../ui/components/buttons/add-to-cart";
import styles from "@/app/ui/styles/product.module.css"; // unified module

interface SpecialProduct {
  product_id: number;
  title: string;
  description: string;
  brand: string | null;
  stock_quantity: number;
  price: number | string | null;
  image_url: string | null;
}

export default function SpecialsPage() {
  const [products, setProducts] = useState<SpecialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/specials");
        if (!res.ok) throw new Error(`Failed to fetch: HTTP ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load specials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSpecials();
  }, []);

  if (loading)
    return (
      <div className={styles.centerMessage}>
        <Loader2 className="animate-spin" size={40} color="#1ab26e" />
        <p>Loading specials…</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );

  if (!products || products.length === 0)
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>🔥 Daily Specials 🔥</h1>
        <div className={styles.centerMessage}>
          <h2>No low stock specials right now</h2>
          <p>Check back later for great deals.</p>
        </div>
      </div>
    );

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>🔥 Last Chance Clearance 🔥</h1>
      <div className={styles.grid}>
        {products.map((product) => (
          <Link
            key={product.product_id}
            href={`/shop/${product.product_id}`}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <div className={`${styles.tag} ${styles.limitedTag}`}>LOW STOCK</div>
              {product.image_url ? (
                <Image
                  src={product.image_url}
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
              <span className={styles.brand}>{product.brand ?? "Clearance Item"}</span>
              <h2 className={styles.title}>{product.title}</h2>
              <p className={styles.description}>
                {product.description?.slice(0, 100) || "Limited time offer due to low stock!"}
                ...
              </p>
              <div style={{ color: "#ef4444", fontWeight: 600 }}>
                Only {product.stock_quantity} left!
              </div>
              <div className={styles.footer}>
                <span className={styles.price}>
                  {product.price != null ? `$${Number(product.price).toFixed(2)}` : "N/A"}
                </span>
                <AddToCartButton productVariantId={product.product_id} quantity={1} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
