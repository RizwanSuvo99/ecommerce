'use client';

import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

/**
 * Hook to access the current authentication state and actions.
 *
 * Must be used within an `<AuthProvider>`.
 *
 * @example
 * ```tsx
 * function NavBar() {
 *   const { user, isAuthenticated, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <Link href="/login">Sign In</Link>;
 *   }
 *
 *   return (
 *     <div>
 *       <span>Welcome, {user.firstName}!</span>
 *       <button onClick={logout}>Log out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth() must be used within an <AuthProvider>. ' +
        'Make sure to wrap your application (or the relevant subtree) with <AuthProvider>.',
    );
  }

  return context;
}
