import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/providers/auth-provider';
import { CartProvider } from '@/providers/cart-provider';

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
}

interface WrapperOptions {
  user?: TestUser | null;
  cartItems?: any[];
  initialRoute?: string;
}

const defaultUser: TestUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'CUSTOMER',
  accessToken: 'fake-jwt-token',
};

function createWrapper(options: WrapperOptions = {}) {
  const { user = null, cartItems = [] } = options;

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider initialUser={user}>
        <CartProvider initialItems={cartItems}>
          {children}
        </CartProvider>
      </AuthProvider>
    );
  };
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: TestUser | null;
  cartItems?: any[];
  initialRoute?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { user: authUser, cartItems, initialRoute, ...renderOptions } = options;

  const Wrapper = createWrapper({ user: authUser, cartItems, initialRoute });
  const userEventInstance = userEvent.setup();

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    user: userEventInstance,
  };
}

export function renderWithAuth(
  ui: ReactElement,
  options: Omit<RenderWithProvidersOptions, 'user'> = {},
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  return renderWithProviders(ui, { ...options, user: defaultUser });
}

export function renderWithAdmin(
  ui: ReactElement,
  options: Omit<RenderWithProvidersOptions, 'user'> = {},
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  return renderWithProviders(ui, {
    ...options,
    user: { ...defaultUser, role: 'ADMIN', name: 'Admin User' },
  });
}

export { defaultUser };
export { render, screen, waitFor, within, act } from '@testing-library/react';
export { userEvent };
