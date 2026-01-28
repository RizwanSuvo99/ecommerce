'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

import { Button } from '@ecommerce/ui';
import { useAuth } from '@/hooks/use-auth';
import { ApiClientError } from '@/lib/api/client';
import { PhoneLoginDialog } from './phone-login-dialog';

// ──────────────────────────────────────────────────────────
// Facebook SDK helper
// ──────────────────────────────────────────────────────────

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

function loadFacebookSDK(): Promise<void> {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      });
      resolve();
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });
}

function facebookLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    window.FB.login(
      (response: any) => {
        if (response.authResponse?.accessToken) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error('Facebook login was cancelled'));
        }
      },
      { scope: 'email,public_profile' },
    );
  });
}

// ──────────────────────────────────────────────────────────
// SVG icons
// ──────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

interface SocialLoginButtonsProps {
  mode?: 'login' | 'register';
}

export function SocialLoginButtons({ mode = 'login' }: SocialLoginButtonsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';
  const { loginWithGoogle, loginWithFacebook, isSubmitting } = useAuth();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

  const handleSuccess = () => {
    toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
    router.push(redirectTo);
    router.refresh();
  };

  const handleError = (error: unknown, provider: string) => {
    if (error instanceof ApiClientError) {
      toast.error(error.message || `${provider} login failed`);
    } else if (error instanceof Error && error.message.includes('cancelled')) {
      // User cancelled — do nothing
    } else {
      toast.error(`${provider} login failed. Please try again.`);
    }
  };

  // ── Google ──────────────────────────────────────────────

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSocialLoading('google');
      try {
        await loginWithGoogle(tokenResponse.access_token);
        handleSuccess();
      } catch (error) {
        handleError(error, 'Google');
      } finally {
        setSocialLoading(null);
      }
    },
    onError: () => {
      toast.error('Google login failed');
    },
  });

  // ── Facebook ────────────────────────────────────────────

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    try {
      await loadFacebookSDK();
      const accessToken = await facebookLogin();
      await loginWithFacebook(accessToken);
      handleSuccess();
    } catch (error) {
      handleError(error, 'Facebook');
    } finally {
      setSocialLoading(null);
    }
  };

  // ── Phone ───────────────────────────────────────────────

  const handlePhoneSuccess = () => {
    setPhoneDialogOpen(false);
    handleSuccess();
  };

  const isLoading = isSubmitting || socialLoading !== null;
  const label = mode === 'login' ? 'Sign in' : 'Sign up';

  return (
    <>
      <div className="space-y-3">
        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={() => googleLogin()}
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          {socialLoading === 'google'
            ? 'Connecting...'
            : `${label} with Google`}
        </Button>

        {/* Facebook */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={handleFacebookLogin}
        >
          <FacebookIcon className="mr-2 h-5 w-5" />
          {socialLoading === 'facebook'
            ? 'Connecting...'
            : `${label} with Facebook`}
        </Button>

        {/* Phone */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={() => setPhoneDialogOpen(true)}
        >
          <PhoneIcon className="mr-2 h-5 w-5 text-teal-600" />
          {`${label} with Phone`}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>

      {/* Phone OTP Dialog */}
      <PhoneLoginDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        onSuccess={handlePhoneSuccess}
      />
    </>
  );
}
