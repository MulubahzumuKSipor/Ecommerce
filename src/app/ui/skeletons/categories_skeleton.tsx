"use client";

import React from "react";
import styles from "@/app/ui/styles/categorySkeleton.module.css";

const CategorySkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => {
  // Generate an array of length `count` to render skeleton cards
  const skeletons = Array.from({ length: count });

  return (
    <div className={styles.grid}>
      {skeletons.map((_, idx) => (
        <div key={idx} className={styles.card}>
          <div className={styles.imageSkeleton} />
          <div className={styles.titleSkeleton} />
        </div>
      ))}
    </div>
  );
};

export default CategorySkeleton;
