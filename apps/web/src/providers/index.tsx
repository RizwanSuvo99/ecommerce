'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth-provider';
import { CartProvider } from './cart-provider';
import { CartDrawer } from '@/components/cart/cart-drawer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <Toaster position="top-right" richColors closeButton duration={3000} />
      </CartProvider>
    </AuthProvider>
  );
}
