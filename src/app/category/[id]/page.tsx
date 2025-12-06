// app/shop/category/[id]/page.tsx (or wherever your component is located)

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import styles from "@/app/ui/styles/category.module.css";
import Link from "next/link";
import AddToCartButton from "@/app/ui/components/buttons/add-to-cart";

interface Product {
    product_id: number; // Use product_id to match SQL output
    title: string;
    description: string;
    brand: string;
    price: number; // Price should be a number for formatting
    category_name: string | null; // Added to potentially display the category name
    images: {
        image_url: string;
        thumbnail_url: string;
        display_order: number;
    }[]; // This is the array returned by json_agg
}

export default function CategoryPage() {
    const params = useParams();
    // Ensure categoryId is treated as a string array or single string from params
    const categoryId = Array.isArray(params.id) ? params.id[0] : params.id;

    // Use the updated Product interface
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentCategoryName, setCurrentCategoryName] = useState('Category');

    useEffect(() => {
        if (!categoryId) return;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // 🟢 FIX: RESTRICTED ROUTE CHANGED TO UNIFIED ROUTE
                // Now uses the /api/products route with the category_id query parameter
                const res = await fetch(`/api/products?category_id=${categoryId}`);

                if (!res.ok) {
                    throw new Error(`Failed to fetch products for category ${categoryId}`);
                }

                const data: Product[] = await res.json();
                setProducts(data);

                // Set the category name for display from the first product
                if (data.length > 0 && data[0].category_name) {
                    setCurrentCategoryName(data[0].category_name);
                }

            } catch (err) {
                console.error(err);
                setError("Could not load products. Please check the network and server status.");
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
                <p>Loading products in {currentCategoryName}...</p>
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
                <h1 className={styles.title}>{currentCategoryName}</h1>
                <h2 className={styles.title} style={{ marginTop: '1rem' }}>No products found</h2>
                <p>This category seems to be empty or has a mapping issue (ID: {categoryId}).</p>
            </div>
        );
    }

    // --- Main List ---
    return (
        <div className={styles.container}>
            <h1 className={styles.title} style={{textTransform: 'uppercase'}}>{currentCategoryName} Products</h1>

            <div className={styles.grid}>
                {products.map((product) => (
                    // Use product.product_id from the SQL output
                    <Link key={product.product_id} href={`/shop/${product.product_id}`} className='link'>
                        <div className={styles.card}>
                            {/* Image Area */}
                            <div className={styles.imageWrapper}>
                                {/* 🟢 FIX: Access the first image URL from the 'images' array */}
                                {product.images?.[0]?.image_url ? (
                                    <Image
                                        src={product.images[0].image_url}
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
                                    <AddToCartButton productVariantId={product.product_id} quantity={1} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}