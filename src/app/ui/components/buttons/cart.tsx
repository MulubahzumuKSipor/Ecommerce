'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/app/ui/styles/cart_button.module.css";
import { readLocalCart, CartItem } from "@/lib/cart";

interface CartButtonProps {
  /** Optional callback fired when the mini-cart opens. */
  onOpen?: () => void;
  /** Are they logged in? */
  loggedIn?: boolean;
  /** Optional API endpoint to fetch cart from server */
  apiUrl?: string;
}

const CartButton: React.FC<CartButtonProps> = ({
  onOpen = () => {},
  loggedIn = false,
  apiUrl = "/api/cart-items",
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  // Count is derived from items
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) onOpen();
  };

  // Fetch cart on mount and listen for updates
  useEffect(() => {
    const fetchCart = async () => {
      if (loggedIn) {
        try {
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error("Failed to fetch cart");
          const data: CartItem[] = await res.json();
          setItems(data);
        } catch (error: unknown) {
          if (error instanceof Error) console.error(error.message);
          else console.error(error);
          setItems([]);
        }
      } else {
        setItems(readLocalCart());
      }
    };

    fetchCart();

    const handleUpdate = () => fetchCart();
    window.addEventListener("cart:update", handleUpdate);
    return () => window.removeEventListener("cart:update", handleUpdate);
  }, [loggedIn, apiUrl]);

  // Optional bump animation when cart count changes
  useEffect(() => {
    if (count > 0) {
      const el = document.querySelector(`.${styles.cartCount}`);
      el?.classList.add(styles.bump);
      const timeout = setTimeout(() => el?.classList.remove(styles.bump), 300);
      return () => clearTimeout(timeout);
    }
  }, [count]);

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.cartButton}
        aria-label={`Shopping cart, ${count} item${count === 1 ? "" : "s"}`}
        aria-expanded={open}
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

        {count > 0 && (
          <span className={styles.cartCount} aria-hidden="true">
            {count}
          </span>
        )}
      </button>

      <aside
        className={`${styles.miniCart} ${open ? styles.open : ""}`}
        role="region"
        aria-label="Mini shopping cart"
        aria-live="polite"
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
              {items.map((item) => (
                <li key={item.product_variant_id}>
                  Product: {item.productId} Variant: {item.variantId || "-"} Qty:{" "}
                  {item.quantity}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.miniCartFooter}>
          <Link href="/cart">
            <button className={styles.viewCartButton}>View cart</button>
          </Link>
          <button className={styles.checkoutButton}>Checkout</button>
        </div>
      </aside>
    </div>
  );
};

export default CartButton;
