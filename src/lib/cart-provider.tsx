'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/client'

export type CartItem = {
  cart_item_id: number
  product_variant_id: number
  quantity: number
  price: number
  product_title: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  total: number
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  addToCart: (variantId: number, qty?: number) => Promise<void>
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: number) => Promise<void>
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Fetch Cart
  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      // Add user header if needed:
      // if (session?.user?.id) headers['x-user-id'] = session.user.id

      const res = await fetch('/api/add-to-cart', { headers })
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Add / Increment Item
  const addToCart = async (product_variant_id: number, quantity = 1) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      // if (session?.user?.id) headers['x-user-id'] = session.user.id

      const res = await fetch('/api/add-to-cart', {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_variant_id, quantity }),
      })

      if (!res.ok) throw new Error('Failed to add to cart')

      await fetchCart()
      setIsOpen(true)
    } catch (error) {
      console.error(error)
      alert('Could not add item to cart.')
    }
  }

  // Update Item Quantity
  const updateCartItem = async (cart_item_id: number, quantity: number) => {
    try {
      if (quantity < 1) return removeFromCart(cart_item_id)

      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }

      const res = await fetch('/api/add-to-cart', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ cart_item_id, quantity }),
      })

      if (!res.ok) throw new Error('Failed to update cart item')
      await fetchCart()
    } catch (error) {
      console.error(error)
      alert('Could not update item quantity.')
    }
  }

  // Remove Item
  const removeFromCart = async (cart_item_id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }

      const res = await fetch(`/api/add-to-cart?cart_item_id=${cart_item_id}`, {
        method: 'DELETE',
        headers,
      })

      if (!res.ok) throw new Error('Failed to remove cart item')
      await fetchCart()
    } catch (error) {
      console.error(error)
      alert('Could not remove item from cart.')
    }
  }

  const toggleCart = () => setIsOpen(prev => !prev)
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isLoading,
        total,
        toggleCart,
        openCart,
        closeCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
