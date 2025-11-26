// app/shop/[id]/page.tsx
import styles from '@/app/ui/styles/detailed_product.module.css';
import Image from 'next/image';
import { StarIcon } from 'lucide-react';
import ProductList from '@/app/ui/components/products';
// import {Product}  from '@/app/types/product';

interface ProductImage {
  image_url: string;
  thumbnail_url?: string;
  display_order?: number;
}

interface Product {
  product_id: number;
  brand: string;
  title: string;
  description: string;
  sku: string;
  price: string; // API returns string
  compare_at_price?: string | null;
  stock_quantity: number;
  category_name: string;
  images: ProductImage[];
  rating?: number;
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

const StarRating = ({ rating }: { rating?: number }) => {
  const value = rating ?? 0;
  return (
    <div className={styles.starRatingContainer}>
      {[0, 1, 2, 3, 4].map((star) => (
        <StarIcon
          key={star}
          className={`${styles.starIcon} ${value > star ? styles.starFilled : styles.starEmpty}`}
          aria-hidden="true"
        />
      ))}
      <p className={styles.ratingText}>{value} out of 5 stars</p>
    </div>
  );
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const res = await fetch(`http://localhost:3000/api/products/${id}`);
  if (!res.ok) return <div>Failed to load product</div>;

  const data: Product[] = await res.json();
  const product = data[0]; // API returns an array

  if (!product) return <div>Product not found</div>;

  const priceNumber = parseFloat(product.price);
  const finalPrice = priceNumber; // Adjust if you add discounts

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className={styles.container}>
      <div className={styles.gridWrapper}>
        {/* LEFT COLUMN */}
        <section className={styles.info_left}>
          <div className={styles.imagePlaceholder}>
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].image_url}
                alt={product.title}
                className={styles.productImage}
                width={650}
                height={650}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div>No image available</div>
            )}
          </div>

          <div className={styles.optionsSection}>
            <div className={styles.productInfoWrapper}>
              <div className={styles.titleSection}>
                <h1 className={styles.productTitle}>{product.title}</h1>
                <p className={styles.productBrand}>{product.brand ? product.brand : product.sku}</p>
              </div>
            </div>

            <p className={styles.price}>Price: {formatCurrency(finalPrice)}</p>
            {product.compare_at_price && (
              <p className={styles.originalPrice}>{formatCurrency(parseFloat(product.compare_at_price))}</p>
            )}

            <div className={styles.reviewsSection}>
              <StarRating rating={product.rating} />
            </div>

            <form className={styles.addToBagForm}>
              <button type="submit" className={styles.addButton} disabled={product.stock_quantity <= 0}>
                {product.stock_quantity > 0 ? 'Add To Cart' : 'Out of stock'}
              </button>
            </form>

            <div className={styles.shippingInfo}>
              <p className={`${styles.statusText} ${product.stock_quantity > 0 ? styles.inStock : styles.outOfStock}`}>
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of stock'}
              </p>
              <p className={styles.availabilityText}>Stock: {product.stock_quantity}</p>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className={styles.info_right}>
          <div className={styles.detailsSection}>
            <div>
              <h3 className="sr-only">Description</h3>
              <div className={styles.descriptionText}>
                <p>{product.description}</p>
              </div>
            </div>

            <div className={styles.highlights}>
              <h3 className={styles.sectionTitle}>Highlights</h3>
              <div className="mt-4">
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ProductList limit={4} />
    </div>
  );
}
