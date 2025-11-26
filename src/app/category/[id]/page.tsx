"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";
// Import the CSS Module
import styles from "@/app/ui/styles/category.module.css";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  description: string;
  brand: string;
  price: number | string;
  image_url: string | null;
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/categories/${categoryId}/products/`);

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Could not load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <Loader2 className="animate-spin" size={40} color="#2563eb" />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  // --- Empty State ---
  if (products.length === 0) {
    return (
      <div className={styles.centerMessage}>
        <h2 className={styles.title}>No products found</h2>
        <p>This category seems to be empty.</p>
      </div>
    );
  }

  // --- Main List ---
  return (
    <div className={styles.container}>
      <h1 className={styles.title}> Products</h1>

      <div className={styles.grid}>
        {products.map((product) => (
          <Link key={product.id} href={`/shop/${product.id}`} className='link'>
            <div className={styles.card}>
              {/* Image Area */}
              <div className={styles.imageWrapper}>
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
              </div>
              {/* Text Content */}
              <div className={styles.content}>
                <span className={styles.brand}>{product.brand}</span>
                <h2 className={styles.title} style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                  {product.title}
                </h2>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                  <button className={styles.button} aria-label="Add to cart">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}