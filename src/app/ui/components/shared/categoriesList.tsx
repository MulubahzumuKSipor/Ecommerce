"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "@/app/ui/styles/categories.module.css";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Category = {
  id: number;
  name: string;
  description?: string | null;
  categories_images: string;
};

export default function CategoryList({ className = "" }: { className?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State to control arrow visibility based on scroll position
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Reference to the scrollable container
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/categories");
        const data: Category[] = await res.json();
        if (!cancelled) {
          setCategories(data);
          // Check scroll position immediately after rendering data
          setTimeout(() => handleScroll(), 0);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => { cancelled = true; };
  }, []);

  // Handler for determining arrow visibility
  const handleScroll = () => {
    if (gridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;

      // Left arrow shows if we scroll past the start
      setShowLeftArrow(scrollLeft > 20);

      // Right arrow hides if scroll position is near the end
      setShowRightArrow(scrollLeft + clientWidth >= scrollWidth - 20);
    }
  };

  // Handler for clicking the arrow buttons
  const scroll = (direction: 'left' | 'right') => {
    if (gridRef.current) {
      // Estimated scroll distance (Card width + Gap)
      const scrollDistance = 184;

      gridRef.current.scrollBy({
        left: direction === 'left' ? -scrollDistance : scrollDistance,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading categories...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Categories</h2>

      <div className={styles.carouselWrapper}>

        {/* The Scrollable/Grid Container */}
        <div
          ref={gridRef}
          className={`${styles.grid} ${className}`}
          onScroll={handleScroll}
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
                style={{ objectFit: "contain" }}
              />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}