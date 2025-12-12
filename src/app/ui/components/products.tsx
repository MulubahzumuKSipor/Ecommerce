// app/components/cards/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "../components/buttons/add-to-cart";
import styles from "@/app/ui/styles/product.module.css";

interface ProductCardProps {
  product?: {
    product_id?: number;
    title?: string;
    brand?: string | null;
    price?: number | string | null;
    compare_at_price?: number | string | null;
    images?: { image_url?: string | null }[] | null;
    isNew?: boolean;
    isTopRated?: boolean;  // ✅ add this
    rating?: number | null;
    stock_quantity?: number | null;
    category_name?: string | null;
  };
}


const ProductList: React.FC<ProductCardProps> = ({ product }) => {
  if (!product) return null;

  const priceNum = product.price != null ? Number(product.price) : 0;
  const comparePriceNum =
    product.compare_at_price != null ? Number(product.compare_at_price) : null;

  const priceFormatted = isFinite(priceNum)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(priceNum)
    : "N/A";

  const comparePriceFormatted =
    comparePriceNum != null && isFinite(comparePriceNum)
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(comparePriceNum)
      : null;

  const stockLow = (product.stock_quantity ?? 0) <= 5;

  const imageUrl = product.images?.[0]?.image_url ?? null;
  const productId = product.product_id ?? 0;

  return (
    <article className={styles.card} aria-labelledby={`product-title-${productId}`}>
      {/* Image + main content link */}
      <Link
        href={`/shop/${productId}`}
        className={styles.link}
        aria-label={`View ${product.title ?? "product"}`}
      >
        <div className={styles.imageWrapper}>
          {product.isNew && <div className={`${styles.tag} ${styles.newTag}`}>NEW</div>}
          {stockLow && <div className={`${styles.tag} ${styles.limitedTag}`}>LIMITED</div>}
          {comparePriceNum != null && (
            <div className={`${styles.tag} ${styles.saleTag}`}>SALE</div>
          )}

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title ?? "Product image"}
              fill
              className={styles.productImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
            />
          ) : (
            <div className={styles.noImage}>No Image</div>
          )}
        </div>

        <div className={styles.content}>
          <span className={styles.brand}>{product.brand ?? "Brand Name"}</span>

          <h3 id={`product-title-${productId}`} className={styles.title}>
            {product.title ?? "Untitled Product"}
          </h3>

          {product.rating != null && (
            <div className={styles.rating}>⭐ {Number(product.rating).toFixed(1)}</div>
          )}
        </div>
      </Link>

      {/* Footer (outside link) */}
      <div className={styles.content} style={{ paddingTop: 0 }}>
        <div className={styles.footer}>
          <div className={styles.prices}>
            <span className={styles.price}>{priceFormatted}</span>

            {comparePriceFormatted && (
              <span className={styles.comparePrice}>{comparePriceFormatted}</span>
            )}
          </div>

          <div className={styles.button}>
            <AddToCartButton productVariantId={productId} quantity={1} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductList;
