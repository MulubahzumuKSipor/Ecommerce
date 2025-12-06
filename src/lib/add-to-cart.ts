// useAddToCart.ts
import { useState, useTransition } from "react";

export function useAddToCart() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const addToCart = (productVariantId: number, quantity = 1) => {
    // Ensure session ID exists
    let sessionId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_id="))
      ?.split("=")[1];

    if (!sessionId) {
      sessionId = "guest_" + Date.now() + Math.random().toString(36).substring(2, 9);
      document.cookie = `session_id=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }

    startTransition(async () => {
      try {
        // 1️⃣ Get current cart items from localStorage for guests
        const localCart: { product_variant_id: number; quantity: number }[] =
          JSON.parse(localStorage.getItem("cart") || "[]");

        const existingItem = localCart.find(
          (item) => item.product_variant_id === productVariantId
        );

        if (existingItem) {
          setMessage("Already added to cart");
          setTimeout(() => setMessage(null), 2000);
          return; // Stop further API call or adding
        }

        // 2️⃣ Add to backend or local storage
        const res = await fetch("/api/add-to-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_variant_id: productVariantId, quantity }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add to cart");
        }

        setMessage("Added to cart!");
        setTimeout(() => setMessage(null), 2000);

        // 3️⃣ Update local cart for guests
        localCart.push({ product_variant_id: productVariantId, quantity });
        localStorage.setItem("cart", JSON.stringify(localCart));

        // 4️⃣ Dispatch cart update for CartButton
        window.dispatchEvent(new CustomEvent("cart:update"));
      } catch (err: unknown) {
        setMessage(err instanceof Error ? `Error: ${err.message}` : "Unknown error");
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  return { addToCart, isPending, message };
}
