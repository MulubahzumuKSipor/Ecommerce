// app/best-sellers/page.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2, AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";
// Using the unified styles
import styles from "@/app/ui/styles/hot-sale.module.css";

// Interface matching the final SQL output structure
interface BestSellerProduct {
  product_id: number;
  title: string;
  description: string;
  brand: string | null;
  price: number | string | null;
  total_stock: number;
  total_sold: number;
  type: 'BEST_SELLER' | 'LOW_STOCK'; // New field for conditional styling
  image_url: string | null;
}

const BestSellersPage: React.FC = () => {
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hot_sale");

        if (!res.ok) {
          throw new Error(`Failed to fetch best sellers: HTTP status ${res.status}`);
        }

        const data = await res.json();
        
        if (data.message) {
            setProducts([]); 
        } else {
            setProducts(data);
        }
        
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Could not load products. Please check the API endpoint.");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const formatPrice = (price: number | string | null) => {
    if (price === null || isNaN(Number(price))) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };
  
  // Renders the correct tag based on the product type
  const renderTag = (product: BestSellerProduct) => {
    if (product.type === 'BEST_SELLER') {
      return (
        <div className={`${styles.statusTag} ${styles.newArrivalTag}`}>
          <TrendingUp size={14} style={{ marginRight: 4 }} /> BEST SELLER
        </div>
      );
    }
    if (product.type === 'LOW_STOCK') {
      return (
        <div className={`${styles.statusTag} ${styles.lowStockTag}`}>
          <AlertTriangle size={14} style={{ marginRight: 4 }} /> LOW STOCK
        </div>
      );
    }
    return null;
  };

  // --- 🔄 Loading State ---
  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <Loader2 className="animate-spin" size={40} color="#3b82f6" />
        <p>Finding the top trending products...</p>
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
        <h1 className={styles.title}>🏆 Top Sellers 🏆</h1>
        <div className={styles.centerMessage}>
          <h2>No data available.</h2>
          <p>We need more sales data to compile this list.</p>
        </div>
      </div>
    );
  }

  // --- 🏆 Main List ---
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🏆 Top Sellers & Clearance Items 🏆</h1>

      <div className={styles.grid}>{products.map((product) => (
          <div key={product.product_id} className={styles.card}><Link href={`/shop/${product.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}><div className={styles.imageWrapper}>{renderTag(product)}{product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
                  />) : (<div className={styles.noImage}>No Image</div> )}
              </div>
              <div className={styles.content}>
                <span className={styles.brand}>{product.brand ?? 'Popular'}</span>
                <h2 className={styles.productTitle}>
                  {product.title}
                </h2>
                <p className={styles.description}>{product.description?.slice(0, 100) || "Check out this top-rated product!"}...
                </p>{product.type === 'LOW_STOCK' && (
                  <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    Only {product.total_stock} left!
                  </div>)}<div className={styles.footer}>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                  <svg
                    className={styles.Cartbutton}
                    aria-label={`Add ${product.title} to cart`}
                    onClick={(e) => { 
                        e.preventDefault(); 
                        alert(`Added ${product.title} to cart!`); 
                    }}

                     xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M17 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63l-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1zm6 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7l2.78-5H6.14l2.36 5z"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSellersPage;