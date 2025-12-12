"use client";

import React from "react";
import styles from "@/app/ui/styles/card-skeleton.module.css";

const ProductSkeleton: React.FC = () => {
  return (
    <div>
      <div className={styles.heading}></div>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageSkeleton} />
          </div>
          <div className={styles.content}>
            <div className={styles.brandSkeleton} />
            <div className={styles.titleSkeleton} />
            <div className={styles.descriptionSkeleton} />
            <div className={styles.footer}>
              <div className={styles.priceSkeleton} />
              <div className={styles.buttonSkeleton} />
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageSkeleton} />
          </div>
          <div className={styles.content}>
            <div className={styles.brandSkeleton} />
            <div className={styles.titleSkeleton} />
            <div className={styles.descriptionSkeleton} />
            <div className={styles.footer}>
              <div className={styles.priceSkeleton} />
              <div className={styles.buttonSkeleton} />
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageSkeleton} />
          </div>
          <div className={styles.content}>
            <div className={styles.brandSkeleton} />
            <div className={styles.titleSkeleton} />
            <div className={styles.descriptionSkeleton} />
            <div className={styles.footer}>
              <div className={styles.priceSkeleton} />
              <div className={styles.buttonSkeleton} />
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageSkeleton} />
          </div>
          <div className={styles.content}>
            <div className={styles.brandSkeleton} />
            <div className={styles.titleSkeleton} />
            <div className={styles.descriptionSkeleton} />
            <div className={styles.footer}>
              <div className={styles.priceSkeleton} />
              <div className={styles.buttonSkeleton} />
            </div>
          </div>
        </div>
        <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <div className={styles.imageSkeleton} />
        </div>
        <div className={styles.content}>
          <div className={styles.brandSkeleton} />
          <div className={styles.titleSkeleton} />
          <div className={styles.descriptionSkeleton} />
          <div className={styles.footer}>
            <div className={styles.priceSkeleton} />
            <div className={styles.buttonSkeleton} />
          </div>
        </div>
      </div>
        </div>
    </div>
  );
};

export default ProductSkeleton;
