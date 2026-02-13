import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuthContext } from '../auth-provider';

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <button
        onClick={() => login({ email: 'test@example.com', password: 'pass' })}
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('should render children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('should provide initial unauthenticated context', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('should update context after login', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).not.toHaveTextContent('none');
    });
  });

  it('should clear context after logout', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    // Login first
    await user.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Logout
    await user.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
  });

  it('should accept initialUser prop', () => {
    const initialUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
      accessToken: 'token',
    };

    render(
      <AuthProvider initialUser={initialUser}>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('Admin');
  });

  it('should throw when useAuthContext is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => render(<TestConsumer />)).toThrow();

    consoleSpy.mockRestore();
  });
});
