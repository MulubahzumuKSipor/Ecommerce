// app/components/NewArrivalsList.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";
// Assuming styles are accessible or imported relative to this component's location
import styles from "@/app/ui/styles/arrivals.module.css"; 

// Interface matching the final SQL output structure
interface NewArrivalProduct {
    product_id: number;
    title: string;
    description: string | null;
    brand: string | null;
    price: number | string | null;
    image_url: string | null;
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
    // Function now depends on the 'limit' prop
    const fetchArrivals = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            // Use the 'limit' prop in the fetch URL
            const apiUrl = `/api/new_arrivals?limit=${limit}`;
            const res = await fetch(apiUrl);

            if (!res.ok) {
                throw new Error(`Failed to fetch new arrivals: HTTP status ${res.status}`);
            }

            const data = await res.json();

            if (data.message) {
                setProducts([]);
            } else {
                setProducts(data);
            }

        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Could not load new arrivals.");
        } finally {
            setLoading(false);
        }
    }, [limit]); // Dependency array includes the 'limit' prop

    // Effect to run the fetch function whenever the limit prop changes
    useEffect(() => {
        fetchArrivals();
    }, [fetchArrivals]);

    // --- Price Formatting Utility (Kept as is) ---
    const formatPrice = (price: number | string | null) => {
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
            {/* Use the customizable title prop */}
            <h1 className={styles.title}>{title}</h1>

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
                                    {product.image_url ? (
                                      <Image
                                        src={product.image_url}
                                        alt={product.title}
                                        fill
                                        className={styles.productImage}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
                                      />) : (<div className={styles.noImage}>No Image</div> )}
                                </div>
                                <div className={styles.content}>
                                    <span className={styles.brand}>{product.brand ?? 'New Brand'}</span>
                                    <h2 className={styles.productTitle}>{product.title}</h2>
                                    <div className={styles.footer}>
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