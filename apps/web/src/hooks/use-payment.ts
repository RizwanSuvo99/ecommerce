'use client';

import { useCallback, useState } from 'react';

import {
  type CheckoutSessionRequest,
  type CheckoutSessionResponse,
  type CODPaymentResponse,
  type PaymentRecord,
  createStripeCheckoutSession,
  redirectToStripeCheckout,
  createCODPayment,
  getPaymentByOrder,
} from '@/lib/api/payment';

interface UsePaymentState {
  isLoading: boolean;
  error: string | null;
  session: CheckoutSessionResponse | null;
  payment: PaymentRecord | null;
}

export function usePayment() {
  const [state, setState] = useState<UsePaymentState>({
    isLoading: false,
    error: null,
    session: null,
    payment: null,
  });

  const startStripeCheckout = useCallback(
    async (data: CheckoutSessionRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await redirectToStripeCheckout(data);
        // User will be redirected to Stripe — no need to update state
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to start Stripe checkout',
        }));
      }
    },
    [],
  );

  const createCheckoutSession = useCallback(
    async (data: CheckoutSessionRequest): Promise<CheckoutSessionResponse | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const session = await createStripeCheckoutSession(data);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          session,
        }));
        return session;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to create checkout session',
        }));
        return null;
      }
    },
    [],
  );

  const initiateCODPayment = useCallback(
    async (orderId: string, amountBDT: number): Promise<CODPaymentResponse | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await createCODPayment(orderId, amountBDT);
        setState((prev) => ({ ...prev, isLoading: false }));
        return result;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to create COD payment',
        }));
        return null;
      }
    },
    [],
  );

  const fetchPaymentDetails = useCallback(async (orderId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const payment = await getPaymentByOrder(orderId);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        payment,
      }));
      return payment;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch payment details',
      }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startStripeCheckout,
    createCheckoutSession,
    initiateCODPayment,
    fetchPaymentDetails,
    clearError,
  };
}
