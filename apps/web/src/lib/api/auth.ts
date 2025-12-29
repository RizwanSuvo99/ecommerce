import type {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileInput,
} from '@ecommerce/types';

import { apiClient } from './client';

// ──────────────────────────────────────────────────────────
// Auth API functions
// ──────────────────────────────────────────────────────────

/**
 * Authenticate a user with email and password.
 */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    payload,
  );
  return data.data;
}

/**
 * Register a new customer account.
 */
export async function register(
  payload: RegisterRequest,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/register',
    payload,
  );
  return data.data;
}

/**
 * Exchange a refresh token for a new token pair.
 */
export async function refreshTokens(
  refreshToken: string,
): Promise<AuthTokens> {
  const { data } = await apiClient.post<ApiResponse<AuthTokens>>(
    '/auth/refresh',
    { refreshToken },
  );
  return data.data;
}

/**
 * Verify an email address using the token sent to the user's inbox.
 */
export async function verifyEmail(
  token: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/verify-email',
    { token },
  );
  return data.data;
}

/**
 * Resend the email verification link/OTP.
 */
export async function resendVerificationEmail(): Promise<{ message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/resend-verification',
  );
  return data.data;
}

/**
 * Request a password reset link to be sent to the given email.
 */
export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/forgot-password',
    payload,
  );
  return data.data;
}

/**
 * Reset password using the token from the password-reset email.
 */
export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/reset-password',
    payload,
  );
  return data.data;
}

/**
 * Change the password for the currently logged-in user.
 * Requires the current password for verification.
 */
export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/change-password',
    payload,
  );
  return data.data;
}

/**
 * Retrieve the currently authenticated user's profile.
 */
export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>(
    '/auth/profile',
  );
  return data.data;
}

/**
 * Update the currently authenticated user's profile fields.
 */
export async function updateProfile(
  payload: UpdateProfileInput,
): Promise<AuthUser> {
  const { data } = await apiClient.patch<ApiResponse<AuthUser>>(
    '/auth/profile',
    payload,
  );
  return data.data;
}

/**
 * Invalidate the current session / refresh token on the server.
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
