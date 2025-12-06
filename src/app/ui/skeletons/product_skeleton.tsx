// BestSellersSkeleton.tsx
import React from 'react';
import styles from "@/app/ui/styles/skeleton.module.css";

// Define how many placeholder cards to show
const SKELETON_COUNT = 8; 

const BestSellersSkeleton: React.FC = () => {
    // Array to map and render multiple skeleton cards
    const skeletonItems = Array.from({ length: SKELETON_COUNT }, (_, index) => index);

    return (
        <div className={styles.grid}>
            {skeletonItems.map((index) => (
                <div key={index} className={`${styles.card} ${styles.skeletonCard}`}>
                    {/* Placeholder Image Area */}
                    <div className={`${styles.imageWrapper} ${styles.skeletonBg}`}>
                        {/* Placeholder for the tag */}
                        <div className={`${styles.statusTag} ${styles.skeletonTag}`}></div>
                    </div>
                    
                    {/* Placeholder Content Area */}
                    <div className={styles.content}>
                        {/* Placeholder for Brand */}
                        <div className={`${styles.brand} ${styles.skeletonText} ${styles.skeletonShort}`}></div>
                        
                        {/* Placeholder for Title */}
                        <div className={`${styles.productTitle} ${styles.skeletonText} ${styles.skeletonMedium}`}></div>
                        
                        {/* Placeholder for Description */}
                        <div className={`${styles.description} ${styles.skeletonText} ${styles.skeletonLong}`}></div>
                        
                        {/* Placeholder for Low Stock Message (Optional, but adds structure) */}
                        <div className={`${styles.lowStockMessage} ${styles.skeletonText} ${styles.skeletonLowStock}`}></div>

                        {/* Placeholder Footer */}
                        <div className={styles.footer}>
                            {/* Placeholder for Price */}
                            <div className={`${styles.price} ${styles.skeletonText} ${styles.skeletonMedium}`}></div>
                            
                            {/* Placeholder for Cart Button */}
                            <div className={`${styles.Cartbutton} ${styles.skeletonButton}`}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BestSellersSkeleton;