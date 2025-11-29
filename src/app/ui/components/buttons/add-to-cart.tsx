"use client";

import React, { useEffect, useState } from "react";
import { CartItem, addOrMergeLocalCart } from "@/lib/cart";

export type AddToCartButtonProps = {
    product_variant_id?: number | string;
  productId: number | string | undefined;
  variantId?: number | string;
  initialQuantity?: number;
  allowQuantity?: boolean;
  size?: "small" | "normal" | "large";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  ariaLabel?: string;
  /** Optional API endpoint for logged-in users */
  apiUrl?: string;
  /** Are they logged in? If true, send to API, else localStorage */
  loggedIn?: boolean;
};

export default function AddToCartButton({
  productId,
  product_variant_id,
  initialQuantity = 1,
  allowQuantity = true,
  size = "normal",
  variant = "primary",
  className = "",
  ariaLabel,
  apiUrl = "/api/cart",
  loggedIn = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(Math.max(1, Math.floor(initialQuantity)));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuantity(Math.max(1, Math.floor(initialQuantity)));
  }, [initialQuantity]);

  const maxQuantity = 99;

  const handleQuantityChange = (next: number) => {
    setQuantity(Math.max(1, Math.min(maxQuantity, Math.floor(next))));
  };

  const addToCart = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const item: CartItem = {  productId, product_variant_id, quantity };

    try {
      if (loggedIn && apiUrl) {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
      } else {
        // guest user → localStorage
        addOrMergeLocalCart(item);
      }

      setSuccess("Added to cart");
      window.dispatchEvent(new CustomEvent("cart:update", { detail: item }));

      setTimeout(() => setSuccess(null), 1500);
    } catch (error: unknown) {
        console.error(error);

        if (error instanceof Error) {
            setError(error.message);
        } else {
            setError("Failed to add to cart");
        }
        } finally {
        setLoading(false);
    }
  };

  return (
    <div className={`add-to-cart-root ${className}`}>
      {allowQuantity && (
        <div className="quantity-group">
          <button onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>−</button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value || 1))}
            min={1}
            max={maxQuantity}
          />
          <button onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= maxQuantity}>+</button>
        </div>
      )}

      <button onClick={addToCart} disabled={loading}>
        {loading ? "Adding…" : "Add to cart"}
      </button>

      {success && <span className="success">{success}</span>}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
