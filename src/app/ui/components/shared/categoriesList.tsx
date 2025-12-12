"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "@/app/ui/styles/categories.module.css";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategorySkeleton from "../../skeletons/categories_skeleton";

type Category = {
  id: number;
  name: string;
  description?: string | null;
  categories_images: string; // representative image url
};

type ProductRow = {
  product_id: number;
  title: string;
  description: string | null;
  brand: string | null;
  rating: number | null;
  variant_id: number | null;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  stock_quantity: number | null;
  category_id: number | null;
  category_name: string | null;
  categories_images: string | null;
};

export default function CategoryList({ className = "" }: { className?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State to control arrow visibility based on scroll position (mobile)
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Reference to the scrollable container
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProductsAndExtractCategories = async () => {
      try {
        // fetch products. you can pass a larger limit if you expect many products
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
        const data: ProductRow[] = await res.json();

        if (cancelled) return;

        // Map to hold unique categories by id
        const map = new Map<number, Category>();

        for (const row of data) {
          const catId = row.category_id;
          const catName = row.category_name ?? "Uncategorized";
          const catImage = row.categories_images ?? "/placeholder-category.png";

          if (catId == null) continue; // skip rows without category

          if (!map.has(catId)) {
            // pick a representative image if available
            let repImage = "";

            if (Array.isArray(row.categories_images) && row.categories_images.length > 0) {
              // images might be nulls; find first valid image_url or thumbnail_url
              const firstImg = row.categories_images.find((img) => img && (img.image_url || img.thumbnail_url));
              if (firstImg) repImage = (firstImg.image_url ?? firstImg.thumbnail_url ?? "") as string;
            }

            map.set(catId, {
              id: catId,
              name: catName,
              description: null,
              categories_images: catImage || "/placeholder-category.png", // fallback placeholder in public/
            });
          }
        }

        const uniqueCategories = Array.from(map.values());
        setCategories(uniqueCategories);

        // wait a tick for layout then update arrow visibility
        setTimeout(() => handleScroll(), 0);
      } catch (err) {
        console.error("Failed to fetch products for categories:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProductsAndExtractCategories();

    return () => { cancelled = true; };
  }, []);

  // Handler for determining arrow visibility
  const handleScroll = () => {
    if (gridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;

      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  // Handler for clicking the arrow buttons
  const scroll = (direction: "left" | "right") => {
    if (gridRef.current) {
      const scrollDistance = 184; // estimated card width + gap
      gridRef.current.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <CategorySkeleton />
    )
  }

  if (categories.length === 0) {
    return <div className={styles.container}><h2>Categories</h2><p>No categories found.</p></div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Categories</h2>

      <div className={styles.carouselWrapper}>
        {/* Left arrow (mobile/scroll) */}
        {showLeftArrow && (
          <button
            aria-label="Scroll left"
            className={`${styles.arrowButton} ${styles.left}`}
            onClick={() => scroll("left")}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* The Scrollable/Grid Container */}
        <div
          ref={gridRef}
          className={`${styles.grid} ${className}`}
          onScroll={handleScroll}
          role="list"
        >
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`} className={styles.card}>
              <div className={styles.title}>{c.name.toUpperCase()}</div>
                <Image
                  src={c.categories_images}
                  alt={c.name}
                  width={40}
                  height={40}
                  unoptimized
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
            </Link>
          ))}
        </div>

        {/* Right arrow (mobile/scroll) */}
        {showRightArrow && (
          <button
            aria-label="Scroll right"
            className={`${styles.arrowButton} ${styles.right}`}
            onClick={() => scroll("right")}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
