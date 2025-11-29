// lib/cart.ts
export type CartItem = {
product_variant_id: number | string | undefined;
  productId: number | string | undefined;
  variantId?: number | string;
  quantity: number;
  addedAt?: string;
  price?: number;
  title?: string;
};

const LOCAL_CART_KEY = "myapp:cart:v1";

/**
 * Read cart from localStorage (guest cart)
 */
export function readLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Write cart to localStorage
 */
export function writeLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Add or merge an item into local cart
 */
export function addOrMergeLocalCart(item: CartItem) {
  const cart = readLocalCart();
  const index = cart.findIndex(
    (i) =>
      String(i.productId) === String(item.productId) &&
      String(i.variantId) === String(item.variantId)
  );

  if (index >= 0) {
    cart[index].quantity = Math.min(99, cart[index].quantity + item.quantity);
  } else {
    cart.push({ ...item, addedAt: new Date().toISOString() });
  }

  writeLocalCart(cart);
  return cart;
}

/**
 * Merge local cart to server (after login)
 */
export async function syncLocalCartToServer(apiUrl: string) {
  const localCart = readLocalCart();
  if (!localCart.length) return;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: localCart }),
  });

  if (!res.ok) throw new Error("Failed to sync cart to server");

  // optionally clear local cart after sync
  writeLocalCart([]);
  return await res.json();
}
