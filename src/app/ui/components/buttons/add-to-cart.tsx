'use client'

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-provider"
import styles from "@/app/ui/styles/add-to-cart.module.css"

interface AddToCartButtonProps {
  productVariantId: number
  quantity?: number
}

export default function AddToCartButton({ productVariantId, quantity = 1 }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleAddToCart = async () => {
    setIsPending(true)
    setMessage(null)

    try {
      await addToCart(productVariantId, quantity)
      setMessage("Added to cart!")
    } catch (error) {
      console.error(error)
      setMessage("Error adding to cart.")
    } finally {
      setIsPending(false)
      // Clear message after 2.5 seconds
      setTimeout(() => setMessage(null), 2500)
    }
  }

  return (
    <div className={styles.container}>
      <button
        onClick={handleAddToCart}
        disabled={isPending}
        className={styles.button}
      >
        {isPending ? "Adding..." : <ShoppingCart size={16} />}
      </button>

      {message && (
        <div
          className={`${styles.message} ${
            message.startsWith("Error") ? styles.error : styles.success
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
