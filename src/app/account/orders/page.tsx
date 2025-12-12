"use client";

import { useEffect, useState } from "react";
import styles from "@/app/ui/styles/orders.module.css";
import { Loader2, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import ProductList from "@/app/ui/components/product_list";
import { supabase } from "@/lib/client"; // use your existing supabase client

interface User {
  username: string;
  email: string;
  phone: string;
  role: string;
  subscribed: boolean;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ Get logged-in user from Supabase
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user) {
          setError("You must be logged in to view this page");
          return;
        }

        const currentUser = data.user;

        setUser({
          username: currentUser.user_metadata.username || "User",
          email: currentUser.email!,
          phone: currentUser.user_metadata.phone || "",
          role: currentUser.user_metadata.role || "customer",
          subscribed: currentUser.user_metadata.subscribed || false,
        });

        // 2️⃣ Fetch orders for this user
        const res = await fetch(`/api/orders/${currentUser.id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.id}`, // token for your API middleware
          },
        });

        const dataOrders = await res.json();
        if (!res.ok) throw new Error(dataOrders.error || "Failed to fetch orders");

        setOrders(dataOrders.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  if (loading)
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.icon} /> Loading your account and orders...
      </div>
    );

  if (error) return <div className={styles.error}>⚠ {error}</div>;

  return (
    <div className={styles.container}>
      {user && (
        <div className={styles.userInfo}>
          <h2>Welcome, {user.username}</h2>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
        </div>
      )}

      <h1 className={styles.title}>Your Orders</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyState}>
            <h2>You haven’t placed any orders yet</h2>
            <p>Looks like you haven’t bought anything yet. Start exploring our products now!</p>
            <button
              className={styles.continueButton}
              onClick={() => (window.location.href = "/shop")}
            >
              Continue Shopping
            </button>
          </div>
          <ProductList limit={5} />
        </div>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((order) => (
            <li key={order.order_id} className={styles.orderCard}>
              <div
                className={styles.orderHeader}
                onClick={() => toggleOrder(order.order_id)}
              >
                <ShoppingBag />
                Order #{order.order_id} - {new Date(order.created_at).toLocaleDateString()}
                <span className={styles.statusBadge}>{order.status}</span>
                {expandedOrders.includes(order.order_id) ? <ChevronUp /> : <ChevronDown />}
              </div>

              <p>Total: ${order.total_amount.toFixed(2)}</p>

              {expandedOrders.includes(order.order_id) && (
                <ul className={styles.orderItems}>
                  {order.items.map((item, idx) => (
                    <li key={idx} className={styles.item}>
                      <span>{item.product_name}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
