'use client';

import { useEffect, useRef, useState } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { toast } from 'sonner';

import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@ecommerce/ui';

import { firebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { ApiClientError } from '@/lib/api/client';

interface PhoneLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PhoneLoginDialog({
  open,
  onOpenChange,
  onSuccess,
}: PhoneLoginDialogProps) {
  const { loginWithPhone, isSubmitting } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+880');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  // ── Countdown timer for resend ──────────────────────────

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Setup reCAPTCHA when dialog opens, cleanup when it closes

  useEffect(() => {
    if (!open) {
      // Reset state when closed
      setStep('phone');
      setOtp('');
      setError(null);
      setCountdown(0);
      confirmationRef.current = null;
      return;
    }

    // Create a persistent container in document.body for reCAPTCHA
    let container = document.getElementById('recaptcha-phone-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-phone-container';
      document.body.appendChild(container);
    }

    // Clean up any previous verifier
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaRef.current = null;
    }

    // Initialize new verifier
    const verifier = new RecaptchaVerifier(firebaseAuth, container, {
      size: 'invisible',
    });

    // Pre-render to get the widget ready
    verifier.render().then((widgetId) => {
      recaptchaWidgetId.current = widgetId;
    }).catch(() => {
      // reCAPTCHA render failed, will retry on send
    });

    recaptchaRef.current = verifier;

    return () => {
      try {
        verifier.clear();
      } catch {
        // ignore
      }
      recaptchaRef.current = null;
      recaptchaWidgetId.current = null;
    };
  }, [open]);

  // ── Step 1: Send OTP ────────────────────────────────────

  const handleSendOtp = async () => {
    setError(null);

    const cleaned = phone.replace(/\s/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) {
      setError('Please enter a valid phone number with country code (e.g. +8801XXXXXXXXX)');
      return;
    }

    if (!recaptchaRef.current) {
      setError('reCAPTCHA not ready. Please close and reopen this dialog.');
      return;
    }

    setLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        cleaned,
        recaptchaRef.current,
      );
      confirmationRef.current = confirmation;
      setStep('otp');
      setCountdown(60);
      toast.success('OTP sent! Check your phone.');
    } catch (err: any) {
      console.error('Phone auth error:', err);

      // Reset reCAPTCHA for retry
      if (recaptchaWidgetId.current !== null && typeof window !== 'undefined' && (window as any).grecaptcha) {
        try {
          (window as any).grecaptcha.reset(recaptchaWidgetId.current);
        } catch {
          // ignore
        }
      }

      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Phone authentication is not enabled. Please contact support.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA verification failed. Please try again.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────

  const handleVerifyOtp = async () => {
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!confirmationRef.current) {
      setError('Session expired. Please request a new OTP.');
      setStep('phone');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const idToken = await result.user.getIdToken();

      await loginWithPhone(idToken);
      onSuccess();
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP has expired. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────

  const handleResend = () => {
    setOtp('');
    setError(null);
    setStep('phone');
  };

  const isLoading = loading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'phone' ? 'Enter your phone number' : 'Enter OTP'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone'
              ? 'We will send a verification code to your phone.'
              : `Enter the 6-digit code sent to ${phone}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <>
              <div>
                <label
                  htmlFor="phone-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <Input
                  id="phone-input"
                  type="tel"
                  placeholder="+8801XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Include country code (e.g. +880 for Bangladesh)
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="otp-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <Input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  disabled={isLoading}
                  autoFocus
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm font-medium text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
