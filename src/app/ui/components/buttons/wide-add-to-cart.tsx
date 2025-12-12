'use client'

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-provider"
import styles from "@/app/ui/styles/wide-add-to-cart.module.css"

interface AddToCartWideButtonProps {
  productVariantId: number
  quantity?: number
  fullWidth?: boolean 
}

export default function AddToCartWideButton({
  productVariantId,
  quantity = 1,
  fullWidth = true,
}: AddToCartWideButtonProps) {
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
      setTimeout(() => setMessage(null), 2500)
    }
  }

  return (
    <div className={styles.container}>
      <button
        onClick={handleAddToCart}
        disabled={isPending}
        className={`${styles.button} ${fullWidth ? styles.fullWidthButton : ""}`}
      >
        {isPending ? "Adding..." : (
          <>
            <ShoppingCart size={20} className={styles.cartIcon} />
            <span className={styles.buttonText}>Add to Cart</span>
          </>
        )}
      </button>

      {message && (
        <div
          className={`${styles.message} ${message.startsWith("Error") ? styles.error : styles.success}`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
