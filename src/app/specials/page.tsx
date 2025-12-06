"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";
// Assuming the CSS module is located here
import styles from "@/app/ui/styles/specials.module.css"; 
import AddToCartButton from "../ui/components/buttons/add-to-cart";

// Interface matching the final SQL output structure (ProductSummary CTE result)
interface SpecialProduct {
  product_id: number;
  title: string;
  description: string;
  brand: string | null;
  // This is the aggregated stock quantity from all variants
  stock_quantity: number; 
  // This is the minimum price from all variants
  price: number | string | null; 
  // This is the single image URL selected by DISTINCT ON
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
        // Fetch from the Next.js API route we designed
        const res = await fetch("/api/specials"); 

        if (!res.ok) {
          throw new Error(`Failed to fetch specials: HTTP status ${res.status}`);
        }

        const data = await res.json();
        
        // Handle the case where the API returns a message (empty set)
        if (data.message) {
            setProducts([]); 
        } else {
            setProducts(data);
        }
        
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Could not load specials. Please ensure the API is running correctly.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecials();
  }, []);

  const formatPrice = (price: number | string | null) => {
    if (price === null || isNaN(Number(price))) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  // --- 🔄 Loading State ---
  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <Loader2 className="animate-spin" size={40} color="#c52919" />
        <p>Loading today's hot deals...</p>
      </div>
    );
  }

  // --- ❌ Error State ---
  if (error) {
    return (
      <div className={styles.centerMessage}>
        <AlertCircle size={48} color="#ef4444" />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  // --- 📦 Empty State ---
  if (products.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🔥 Daily Specials 🔥</h1>
        <div className={styles.centerMessage}>
          <h2>No Low Stock Specials Right Now</h2>
          <p>All stock is healthy! Check back later for great deals.</p>
        </div>
      </div>
    );
  }

  // --- 🛒 Main Specials List ---
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🔥 Last Chance Clearance 🔥</h1>

      <div className={styles.grid}>
        {products.map((product) => (
          // Card wrapper is a link
          <div key={product.product_id} className={styles.card}>
            <Link href={`/shop/${product.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              
              {/* Image Area */}
              <div className={styles.imageWrapper}>
                {/* Sale Tag */}
                <div className={styles.saleTag}>LOW STOCK!</div>
                
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

              {/* Text Content */}
              <div className={styles.content}>
                <span className={styles.brand}>{product.brand ?? 'Clearance Item'}</span>
                
                <h2 className={styles.productTitle} style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                  {product.title}
                </h2>
                
                <p className={styles.description}>
                  {product.description?.slice(0, 100) || "Limited time offer due to low stock!"}...
                </p>

                {/* Stock Warning based on the aggregated total stock */}
                <div className={styles.stockWarning}>
                    Only **{product.stock_quantity}** total left!
                </div>

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