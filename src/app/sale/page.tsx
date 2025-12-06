"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";
import styles from "@/app/ui/styles/hot-sale.module.css";
import BestSellersSkeleton from "../ui/skeletons/product_skeleton";
import AddToCartButton from "../ui/components/buttons/add-to-cart";

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
  <BestSellersSkeleton />
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
      <h1 className={styles.title}> Trending </h1>
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
          <p className={styles.description}>{product.description?.slice(0, 100) || "Check out this top-rated product!"}...</p>
          {product.type === 'LOW_STOCK' && (
            <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>
              Only {product.total_stock} left!
            </div>)}
            <div className={styles.footer}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              <AddToCartButton productVariantId={product.product_id} quantity={1} />
            </div>
      </div>
      </Link>
  </div>))}
  </div>
</div>
);
};

export default BestSellersPage;