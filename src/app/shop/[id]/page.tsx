"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import ProductList from "@/app/ui/components/products";
import AddToCartWideButton from "@/app/ui/components/buttons/wide-add-to-cart";
import { StarIcon } from "lucide-react";
import styles from "@/app/ui/styles/detailed_product.module.css";

interface ProductImage {
  image_url: string;
  thumbnail_url?: string;
  display_order?: number;
}

interface Product {
  product_id: number;
  brand?: string | null;
  title: string;
  description?: string;
  sku?: string;
  price: string | number;
  compare_at_price?: string | number | null;
  stock_quantity: number;
  category_name?: string;
  images?: ProductImage[];
  rating?: number;
  isNew?: boolean;
  isTopRated?: boolean;
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const StarRating = ({ rating }: { rating?: number }) => {
  const value = rating ?? 0;
  return (
    <div className={styles.starRatingContainer}>
      {[0, 1, 2, 3, 4].map((star) => (
        <StarIcon
          key={star}
          className={`${styles.starIcon} ${value > star ? styles.starFilled : styles.starEmpty}`}
        />
      ))}
      <p className={styles.ratingText}>{value} / 5</p>
    </div>
  );
};

export default function ProductPage({ params }: ProductPageProps) {
  // unwrap the promise
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // fetch product
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data: Product[] = await res.json();
        const fetchedProduct = data[0] || null;
        setProduct(fetchedProduct);

        // fetch related products in same category
        if (fetchedProduct?.category_name) {
          const relatedRes = await fetch(
            `/api/products?category=${encodeURIComponent(fetchedProduct.category_name)}&limit=4`
          );
          const relatedData: Product[] = await relatedRes.json();
          setRelated(relatedData.filter((p) => p.product_id !== fetchedProduct.product_id));
        }
      } catch (err) {
        console.error(err);
        setError("Could not load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatCurrency = (amount: number | string | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount));
  };

  if (loading) return <p className={styles.centerMessage}>Loading product…</p>;
  if (error || !product) return <p className={styles.centerMessage}>Product not found</p>;

  const priceNumber = Number(product.price);
  const compareNumber = product.compare_at_price ? Number(product.compare_at_price) : null;
  const stockLow = product.stock_quantity <= 5;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{product.title}</h1>

      <div className={styles.grid}>
        {/* LEFT COLUMN */}
        <div className={styles.info_left}>
          <div className={styles.imageWrapper}>
            {product.isNew && <div className={`${styles.badge} ${styles.newBadge}`}>NEW</div>}
            {product.isTopRated && <div className={`${styles.badge} ${styles.topRatedBadge}`}>TOP RATED</div>}
            {stockLow && <div className={`${styles.badge} ${styles.limitedBadge}`}>LIMITED</div>}
            {compareNumber && <div className={`${styles.badge} ${styles.saleBadge}`}>SALE</div>}

            {product.images?.[0]?.image_url ? (
              <Image
                src={product.images[0].image_url}
                alt={product.title}
                fill
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
          </div>

          <div className={styles.detailsWrapper}>
            <span className={styles.brand}>{product.brand ?? "Popular"}</span>
            <StarRating rating={product.rating} />

            <div className={styles.priceRow}>
              <span className={styles.price}>{formatCurrency(priceNumber)}</span>
              {compareNumber && <span className={styles.comparePrice}>{formatCurrency(compareNumber)}</span>}
            </div>

            <AddToCartWideButton productVariantId={product.product_id} quantity={1} />

            <p className={`${styles.statusText} ${product.stock_quantity > 0 ? styles.inStock : styles.outOfStock}`}>
              {product.stock_quantity > 0 ? "In Stock" : "Out of stock"}
            </p>
            <p className={styles.availabilityText}>Stock: {product.stock_quantity}</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.info_right}>
          <div className={styles.descriptionText}>
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className={styles.highlights}>
            <h3 className={styles.sectionTitle}>Highlights</h3>
            <table className={styles.highlightsTable}>
              <tbody>
                <tr>
                  <th>Category</th>
                  <td>{product.category_name}</td>
                </tr>
                <tr>
                  <th>SKU</th>
                  <td>{product.sku}</td>
                </tr>
                <tr>
                  <th>Price</th>
                  <td>{formatCurrency(priceNumber)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Placeholder for comments */}
          <div className={styles.commentsSection}>
            <h3>Customer Reviews</h3>
            <div className={styles.commentsPlaceholder}>Comments section coming soon…</div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className={styles.relatedGrid}>
        {related.map((p) => (
          <div key={p.product_id} className={styles.relatedCard}>
            <div className={styles.relatedImageWrapper}>
              {p.images?.[0]?.image_url ? (
                <Image src={p.images[0].image_url} alt={p.title} width={100} height={100} />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
              <div className={styles.relatedBadges}>
                {p.isNew && <span className={`${styles.relatedBadge} ${styles.new}`}>NEW</span>}
                {p.isTopRated && <span className={`${styles.relatedBadge} ${styles.topRated}`}>TOP RATED</span>}
                {p.stock_quantity <= 5 && <span className={`${styles.relatedBadge} ${styles.limited}`}>LIMITED</span>}
                {p.compare_at_price && <span className={`${styles.relatedBadge} ${styles.sale}`}>SALE</span>}
              </div>
            </div>
            <div className={styles.relatedDetails}>
              <span className={styles.relatedBrand}>{p.brand ?? "Popular"}</span>
              <span className={styles.relatedTitle}>{p.title}</span>
              <div className={styles.relatedPriceRow}>
                <span className={styles.relatedPrice}>${p.price}</span>
                {p.compare_at_price && <span className={styles.relatedComparePrice}>${p.compare_at_price}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
