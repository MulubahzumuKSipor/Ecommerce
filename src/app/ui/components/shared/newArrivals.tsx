// app/components/NewArrivalsList.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import styles from "@/app/ui/styles/arrivals.module.css"; 

interface NewArrivalProduct {
    product_id: number;
    title: string;
    description: string | null;
    brand: string | null;
    rating: number | null; // Added rating
    variant_id: number | null; // Added variant_id
    sku: string | null; // Added sku
    price: number; // Price is essential, set as required number
    compare_at_price: number | null; // Added compare_at_price
    stock_quantity: number | null; // Added stock_quantity
    category_id: number | null; // Added category_id
    category_name: string | null; // Added category_name
    images: {
        image_url: string;
        thumbnail_url: string;
        display_order: number;
    }[]; // This is the array returned by json_agg
}

// Define the component's props
interface NewArrivalsListProps {
    limit: number; // REQUIRED prop to specify how many items to fetch
    title?: string; // Optional title override
}

// Update the component signature to accept props
const NewArrivalsList: React.FC<NewArrivalsListProps> = ({ limit, title = "✨ New Arrivals ✨" }) => {
    const [products, setProducts] = useState<NewArrivalProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Hook (Refactored using useCallback) ---
    const fetchArrivals = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            // 🟢 FIX: Use the URL matching the component's expectation or the actual API file name
            const apiUrl = `/api/products?limit=${limit}`; // Assuming you renamed the component or the API file is called 'products/route.ts'

            const res = await fetch(apiUrl, {
                 // Important for Client Components to ensure fresh data
                 cache: 'no-store'
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch new arrivals: HTTP status ${res.status}`);
            }

            const data = await res.json();
            setProducts(data);

        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Could not load new arrivals. Please check the server.");
        } finally {
            setLoading(false);
        }
    }, [limit]);

    // Effect to run the fetch function whenever the limit prop changes
    useEffect(() => {
        fetchArrivals();
    }, [fetchArrivals]);

    // --- Price Formatting Utility (Kept as is) ---
    const formatPrice = (price: number) => {
        if (price === null || isNaN(Number(price))) return "N/A";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(Number(price));
    };

    // --- 🔄 Loading State ---
    if (loading && products.length === 0) {
        return (
            <div className={styles.centerMessage}>
                <Loader2 className="animate-spin" size={32} color="#1ab26e" />
                <p>Loading {limit} new products...</p>
            </div>
        );
    }

    // --- ❌ Error State ---
    if (error) {
        return (
            <div className={styles.centerMessage}>
                <AlertCircle size={40} color="#ef4444" />
                <p className={styles.errorText}>{error}</p>
            </div>
        );
    }

    // --- 🚀 Main Arrivals List ---
    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 className={styles.heading} style={{ marginBottom: 0 }}>
                    {title}
                </h2>
                {/* Optional: Show a "View All" link if we are limiting the view */}
                {limit && (
                    <Link href="/arrivals" style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}>
                        View All &rarr;
                    </Link>
                )}
            </div>

            {products.length === 0 ? (
                <div className={styles.centerMessage} style={{ marginTop: '2rem' }}>
                    <h2>Nothing new just yet!</h2>
                    <p>No products available to show for limit of {limit}.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {products.map((product) => (
                        <div key={product.product_id} className={styles.card}>
                            <Link href={`/shop/${product.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className={styles.imageWrapper}>
                                    <div className={`${styles.statusTag} ${styles.newArrivalTag}`}>NEW</div>
                                    {/* 🟢 FIX: Access the first image URL from the 'images' array */}
                                    {product.images?.[0]?.image_url ? (
                                        <Image
                                          src={product.images[0].image_url}
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
                                    <span className={styles.brand}>{product.brand ?? 'New Brand'}</span>
                                    <h2 className={styles.productTitle}>{product.title}</h2>
                                    <div className={styles.footer}>
                                        {/* FIX: Ensure product.price is defined before calling formatPrice */}
                                        <span className={styles.price}>{formatPrice(product.price)}</span>
                                        <button
                                            className={styles.button}
                                            onClick={(e) => { e.preventDefault(); alert(`Added ${product.product_id} to cart!`); }}
                                        >
                                            <ShoppingCart size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewArrivalsList;