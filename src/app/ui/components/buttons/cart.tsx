'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/lib/cart-provider"
import styles from "@/app/ui/styles/cart_button.module.css"

export default function CartButton() {
  const { items, addToCart, updateCartItem, removeFromCart } = useCart()
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(false)

  // Total count
  const count = items.reduce((acc, item) => acc + item.quantity, 0)

  // Trigger bump animation when cart updates
  useEffect(() => {
  if (count === 0) return

  // Wrap in setTimeout to avoid synchronous state update
  const timer1 = setTimeout(() => setBump(true), 0)
  const timer2 = setTimeout(() => setBump(false), 300)

  return () => {
    clearTimeout(timer1)
    clearTimeout(timer2)
  }
}, [count])

  // Toggle drawer
  const toggleOpen = () => setOpen(prev => !prev)

  return (
    <div className={styles.container}>
      {/* Cart Button */}
      <button
        type="button"
        className={`${styles.cartButton} ${bump ? styles.bump : ""}`}
        aria-label={`Shopping cart, ${count} item${count === 1 ? "" : "s"}`}
        onClick={toggleOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className={styles.cartIcon}
        >
          <path
            fill="currentColor"
            d="M17 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63l-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1zm6 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7l2.78-5H6.14l2.36 5z"
          />
        </svg>

        {count > 0 && <span className={styles.cartCount}>{count}</span>}
      </button>

      {/* Mini Cart Drawer */}
      <aside
        className={`${styles.miniCart} ${open ? styles.open : ""}`}
        role="region"
        aria-label="Mini shopping cart"
      >
        <div className={styles.miniCartHeader}>
          <strong>Your cart</strong>
          <button
            className={styles.closeButton}
            aria-label="Close cart"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.miniCartBody}>
          {items.length === 0 ? (
            <p className={styles.emptyText}>Your cart is empty.</p>
          ) : (
            <ul className={styles.itemsList}>
              {items.map(item => (
                <li key={item.cart_item_id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{item.product_title}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  <div className={styles.itemControls}>
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => updateCartItem(item.cart_item_id, item.quantity - 1)}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.cart_item_id, item.quantity + 1)}
                      className={styles.quantityButton}
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.cart_item_id)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.miniCartFooter}>
            <Link href="/cart">
              <button className={styles.viewCartButton}>View cart</button>
            </Link>
            <Link href="/checkout">
              <button className={styles.checkoutButton}>Checkout</button>
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
