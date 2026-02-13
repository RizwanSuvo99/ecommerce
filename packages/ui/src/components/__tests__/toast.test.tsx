import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  useToast,
} from '../toast';

function ToastDemo() {
  const { toast, dismiss } = useToast();

  return (
    <div>
      <button
        onClick={() =>
          toast({
            title: 'Success',
            description: 'Item added to cart',
            variant: 'default',
          })
        }
      >
        Show Toast
      </button>
      <button
        onClick={() =>
          toast({
            title: 'Error',
            description: 'Something went wrong',
            variant: 'destructive',
          })
        }
      >
        Show Error
      </button>
      <button onClick={() => dismiss()}>Dismiss All</button>
    </div>
  );
}

describe('Toast', () => {
  it('should render toast with title and description', () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Notification</ToastTitle>
          <ToastDescription>This is a notification</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a notification')).toBeInTheDocument();
  });

  it('should render different variants', () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast open variant="default">
          <ToastTitle>Default</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <Toast open variant="destructive">
          <ToastTitle>Error</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should show toast via useToast hook', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastDemo />
        <ToastViewport />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Item added to cart')).toBeInTheDocument();
    });
  });

  it('should show destructive toast', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastDemo />
        <ToastViewport />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('should dismiss toast', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastDemo />
        <ToastViewport />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Dismiss All'));
    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });
});
