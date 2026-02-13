import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../dialog';

describe('Dialog', () => {
  it('should not render content when closed', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('should open when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Dialog description')).toBeInTheDocument();
    });
  });

  it('should render when open prop is true', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
  });

  it('should call onOpenChange when dialog state changes', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should close when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });
});
