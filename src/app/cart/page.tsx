'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-provider'
import styles from '@/app/ui/styles/cart_page.module.css'

export default function CartPage() {
  const { items, total, isLoading, addToCart, updateCartItem, removeFromCart } = useCart()

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Shopping Cart</h1>

        {isLoading && items.length === 0 ? (
          <div className={styles.loadingCart}>
            <p>Loading your cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyCart}>
            <h2>Your cart is empty</h2>
            <p>Looks like you have not added anything to your cart yet.</p>
            <Link href="/shop" className={styles.checkoutButton}>Start Shopping</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Cart Table Section */}
            <section className={styles.cartSection}>
              <div className={styles.tableContainer}>
                <table className={styles.cartTable}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variant ID</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.cart_item_id}>
                        <td>
                          <Link href={`/product/${item.product_variant_id}`} className="hover:underline">
                            {item.product_title}
                          </Link>
                        </td>
                        <td>{item.product_variant_id}</td>
                        <td>
                          <div className={styles.quantityControl}>
                            <button
                              className={styles.quantityButtonDisabled}
                              disabled={item.quantity <= 1}
                              onClick={() => updateCartItem(item.cart_item_id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              className={styles.quantityButton}
                              onClick={() => updateCartItem(item.cart_item_id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            className={styles.removeButton}
                            onClick={() => removeFromCart(item.cart_item_id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Order Summary Section */}
            <section className={styles.orderSummarySection}>
              <div className={styles.orderSummaryContainer}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>

                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping estimate</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className={styles.summaryRowTotal}>
                  <span>Order Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className={`${styles.checkoutButton} ${items.length === 0 ? styles.checkoutButtonDisabled : ''}`}
                >
                  Checkout
                </Link>

                <div className={styles.continueShopping}>
                  or <Link href="/shop">Continue Shopping →</Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
