import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment variable validation and type-safe access.
 *
 * Uses @t3-oss/env-nextjs to validate environment variables at build time
 * and provide type-safe access throughout the application.
 *
 * @see https://env.t3.gg/docs/nextjs
 */
export const env = createEnv({
  // ─────────────────────────────────────────────────────────
  // Server-side environment variables (not exposed to client)
  // ─────────────────────────────────────────────────────────
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    /** Stripe secret key for server-side payment processing */
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),

    /** Stripe webhook secret for verifying webhook signatures */
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  },

  // ─────────────────────────────────────────────────────────
  // Client-side environment variables (exposed to browser)
  // All must be prefixed with NEXT_PUBLIC_
  // ─────────────────────────────────────────────────────────
  client: {
    /** Base URL of the backend API */
    NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),

    /** Base URL of this Next.js application */
    NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),

    /** Stripe publishable key for client-side Stripe.js */
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
      .string()
      .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),
  },

  // ─────────────────────────────────────────────────────────
  // Runtime values — map process.env to the schema above
  // ─────────────────────────────────────────────────────────
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  // ─────────────────────────────────────────────────────────
  // Options
  // ─────────────────────────────────────────────────────────

  /**
   * Skip validation in CI/Docker builds where env vars might
   * not be available yet. Set SKIP_ENV_VALIDATION=1 to bypass.
   */
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",

  /**
   * Treat empty strings as undefined so that
   * `NEXT_PUBLIC_API_URL=""` is treated as missing.
   */
  emptyStringAsUndefined: true,
});
