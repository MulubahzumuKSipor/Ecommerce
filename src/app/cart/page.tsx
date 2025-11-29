"use client";

import React, { useEffect, useState } from "react";
import { CartItem, readLocalCart } from "@/lib/cart";

type Props = { apiUrl?: string; loggedIn?: boolean };

export default function CartPage({ apiUrl = "/api/cart", loggedIn = false }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      if (loggedIn) {
        try {
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error("Failed to fetch cart");
          const data: CartItem[] = await res.json();
          setItems(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setItems(readLocalCart());
      }
    };

    fetchCart();

    const handleUpdate = () => fetchCart();
    window.addEventListener("cart:update", handleUpdate);
    return () => window.removeEventListener("cart:update", handleUpdate);
  }, [apiUrl, loggedIn]);

  if (!items.length) return <div>Your cart is empty.</div>;

  return (
    <div>
      <h1>Your cart</h1>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            Product: {item.productId} Variant: {item.variantId || "-"} Qty: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
