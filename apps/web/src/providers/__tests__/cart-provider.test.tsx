import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCartContext } from '../cart-provider';

function TestConsumer() {
  const { items, itemCount, subtotal, total, addItem, removeItem, clearCart } =
    useCartContext();

  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <span data-testid="total">{total}</span>
      <ul data-testid="items">
        {items.map((item: any) => (
          <li key={item.productId}>
            {item.name} x{item.quantity}
            <button onClick={() => removeItem(item.productId)}>Remove</button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          addItem({
            productId: 'prod-1',
            name: 'Widget',
            price: 1999,
            quantity: 1,
            image: 'widget.jpg',
          })
        }
      >
        Add Widget
      </button>
      <button onClick={clearCart}>Clear</button>
    </div>
  );
}

describe('CartProvider', () => {
  it('should render children', () => {
    render(
      <CartProvider>
        <div data-testid="child">Cart content</div>
      </CartProvider>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Cart content');
  });

  it('should provide initial empty cart context', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('subtotal')).toHaveTextContent('0');
  });

  it('should add items through context', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await user.click(screen.getByText('Add Widget'));

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });

  it('should remove items through context', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await user.click(screen.getByText('Add Widget'));
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    await user.click(screen.getByText('Remove'));
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });
  });

  it('should clear all items through context', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await user.click(screen.getByText('Add Widget'));
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    await user.click(screen.getByText('Clear'));
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });
  });

  it('should accept initialItems prop', () => {
    const initialItems = [
      { productId: 'p1', name: 'Item 1', price: 1000, quantity: 2, image: 'i1.jpg' },
    ];

    render(
      <CartProvider initialItems={initialItems}>
        <TestConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('should throw when useCartContext is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => render(<TestConsumer />)).toThrow();

    consoleSpy.mockRestore();
  });
});
