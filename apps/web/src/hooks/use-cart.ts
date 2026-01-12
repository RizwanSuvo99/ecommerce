'use client';

import { useContext } from 'react';

import { CartContext, type CartContextValue } from '@/providers/cart-provider';

/**
 * Hook to access the shopping cart state and actions.
 *
 * Must be used within a `<CartProvider>`.
 *
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const { addItem, isUpdating } = useCart();
 *
 *   const handleAddToCart = () => {
 *     addItem({
 *       productId: product.id,
 *       quantity: 1,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleAddToCart} disabled={isUpdating}>
 *       Add to Cart
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function CartBadge() {
 *   const { itemCount, toggleCart } = useCart();
 *
 *   return (
 *     <button onClick={toggleCart}>
 *       Cart ({itemCount})
 *     </button>
 *   );
 * }
 * ```
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error(
      'useCart() must be used within a <CartProvider>. ' +
        'Make sure to wrap your application (or the relevant subtree) with <CartProvider>.',
    );
  }

  return context;
}
