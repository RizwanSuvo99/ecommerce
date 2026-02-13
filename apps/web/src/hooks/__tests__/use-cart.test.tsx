import { renderHook, act, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { useCart } from '../use-cart';
import { CartProvider } from '@/providers/cart-provider';
import { AuthProvider } from '@/providers/auth-provider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

describe('useCart', () => {
  it('should return empty cart initially', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('should add item to cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem({
        productId: 'prod-1',
        name: 'Test Product',
        price: 2999,
        quantity: 1,
        image: 'test.jpg',
      });
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
      expect(result.current.itemCount).toBe(1);
    });
  });

  it('should update item quantity', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem({
        productId: 'prod-1',
        name: 'Test Product',
        price: 2999,
        quantity: 1,
        image: 'test.jpg',
      });
    });

    await act(async () => {
      await result.current.updateQuantity('prod-1', 3);
    });

    await waitFor(() => {
      expect(result.current.items[0]?.quantity).toBe(3);
    });
  });

  it('should remove item from cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem({
        productId: 'prod-1',
        name: 'Test Product',
        price: 2999,
        quantity: 1,
        image: 'test.jpg',
      });
    });

    await act(async () => {
      await result.current.removeItem('prod-1');
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
    });
  });

  it('should clear cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem({
        productId: 'prod-1',
        name: 'Product 1',
        price: 2999,
        quantity: 1,
        image: 'test.jpg',
      });
      await result.current.addItem({
        productId: 'prod-2',
        name: 'Product 2',
        price: 1500,
        quantity: 2,
        image: 'test2.jpg',
      });
    });

    await act(async () => {
      await result.current.clearCart();
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });
  });

  it('should apply coupon code', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem({
        productId: 'prod-1',
        name: 'Test Product',
        price: 5000,
        quantity: 2,
        image: 'test.jpg',
      });
    });

    await act(async () => {
      await result.current.applyCoupon('SAVE20');
    });

    await waitFor(() => {
      expect(result.current.couponCode).toBe('SAVE20');
    });
  });
});
