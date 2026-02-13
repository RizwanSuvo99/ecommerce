import { renderHook, act, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { useAuth } from '../use-auth';
import { AuthProvider } from '@/providers/auth-provider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('should return initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should login and update state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(
        expect.objectContaining({ email: 'test@example.com' }),
      );
    });
  });

  it('should logout and clear state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login failure', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({
          email: 'wrong@example.com',
          password: 'wrong',
        });
      }),
    ).rejects.toThrow();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should register a new user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'NewPassword123!',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should refresh token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
