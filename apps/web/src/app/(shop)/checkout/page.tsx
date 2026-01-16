'use client';

import { useState, useMemo } from 'react';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

/**
 * Checkout steps in order.
 */
const CHECKOUT_STEPS = [
  { id: 'address', label: 'Address', icon: '📍' },
  { id: 'shipping', label: 'Shipping', icon: '🚚' },
  { id: 'payment', label: 'Payment', icon: '💳' },
  { id: 'review', label: 'Review', icon: '✅' },
] as const;

type StepId = (typeof CHECKOUT_STEPS)[number]['id'];

/**
 * Checkout data collected across steps.
 */
interface CheckoutData {
  addressId: string | null;
  shippingMethodId: string | null;
  paymentMethod: string | null;
  couponCode: string | null;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// ──────────────────────────────────────────────────────────
// Stepper Component
// ──────────────────────────────────────────────────────────

interface StepperProps {
  currentStep: StepId;
  completedSteps: StepId[];
  onStepClick: (step: StepId) => void;
}

function Stepper({ currentStep, completedSteps, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {CHECKOUT_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = isCompleted || isCurrent;

          return (
            <li key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-2 w-full group ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Step circle */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-xs font-medium ${
                    isCurrent
                      ? 'text-blue-600'
                      : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < CHECKOUT_STEPS.length - 1 && (
                <div
                  className={`hidden sm:block h-0.5 flex-1 mx-2 mt-[-1.5rem] ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ──────────────────────────────────────────────────────────
// Order Summary Sidebar
// ──────────────────────────────────────────────────────────

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  shippingCost: number | null;
  tax: number | null;
  total: number;
  itemCount: number;
}

function OrderSummary({
  subtotal,
  discount,
  shippingCost,
  tax,
  total,
  itemCount,
}: OrderSummaryProps) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shippingCost !== null ? 'font-medium text-gray-900' : 'text-gray-400 italic'}>
            {shippingCost !== null
              ? shippingCost === 0
                ? 'Free'
                : formatPrice(shippingCost)
              : 'Calculated next'}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax (VAT 15%)</span>
          <span className={tax !== null ? 'font-medium text-gray-900' : 'text-gray-400 italic'}>
            {tax !== null ? formatPrice(tax) : 'Included'}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-gray-200" />

      <div className="flex justify-between items-baseline">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-gray-900">
          {formatPrice(total)}
        </span>
      </div>

      <p className="mt-1 text-xs text-gray-400 text-right">
        BDT ৳ (Bangladeshi Taka)
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Checkout Page
// ──────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<StepId>('address');
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    addressId: null,
    shippingMethodId: null,
    paymentMethod: null,
    couponCode: null,
  });

  // Placeholder order summary values
  const orderSummary = useMemo(
    () => ({
      subtotal: 0,
      discount: 0,
      shippingCost: checkoutData.shippingMethodId ? 0 : null,
      tax: null,
      total: 0,
      itemCount: 0,
    }),
    [checkoutData.shippingMethodId],
  );

  /**
   * Mark the current step as completed and advance to the next step.
   */
  const goToNextStep = () => {
    const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.id === currentStep);

    if (currentIndex < CHECKOUT_STEPS.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      setCurrentStep(CHECKOUT_STEPS[currentIndex + 1].id);
    }
  };

  /**
   * Go back to the previous step.
   */
  const goToPreviousStep = () => {
    const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.id === currentStep);

    if (currentIndex > 0) {
      setCurrentStep(CHECKOUT_STEPS[currentIndex - 1].id);
    }
  };

  /**
   * Handle clicking on a step in the stepper.
   */
  const handleStepClick = (stepId: StepId) => {
    setCurrentStep(stepId);
  };

  /**
   * Render the current step's content.
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 'address':
        return (
          <div className="rounded-xl bg-white border border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Shipping Address
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Select or add a delivery address
            </p>
            {/* AddressStep component will be added in next commit */}
            <div className="py-12 text-center text-gray-400">
              Address selection step
            </div>
            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Continue to Shipping
              </button>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="rounded-xl bg-white border border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Shipping Method
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Choose your preferred delivery option
            </p>
            {/* ShippingStep component will be added in next commit */}
            <div className="py-12 text-center text-gray-400">
              Shipping method selection step
            </div>
            <div className="flex justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Address
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="rounded-xl bg-white border border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Method
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              How would you like to pay?
            </p>
            {/* PaymentStep component will be added in next commit */}
            <div className="py-12 text-center text-gray-400">
              Payment method selection step
            </div>
            <div className="flex justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Shipping
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Continue to Review
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="rounded-xl bg-white border border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Review Your Order
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Please verify everything before placing your order
            </p>
            {/* ReviewStep component will be added in next commit */}
            <div className="py-12 text-center text-gray-400">
              Order review and confirmation step
            </div>
            <div className="flex justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Payment
              </button>
              <button
                type="button"
                className="rounded-xl bg-green-600 px-8 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Place Order
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page title */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Checkout
      </h1>

      {/* Stepper */}
      <Stepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Main content: step form + sidebar */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Step content */}
        <div className="lg:col-span-8">
          {renderStepContent()}
        </div>

        {/* Order summary sidebar */}
        <div className="mt-10 lg:mt-0 lg:col-span-4">
          <OrderSummary {...orderSummary} />
        </div>
      </div>
    </div>
  );
}
