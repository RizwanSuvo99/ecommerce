import { isAxiosError } from 'axios';

/**
 * Extract a user-facing error message from an Axios/fetch error.
 *
 * NestJS exception filters serialize errors as
 * `{ message: string | string[], error?: string, statusCode: number }`,
 * so the most useful text usually lives at `err.response.data.message`.
 * Falls back to `err.message`, then the supplied default — never throws,
 * never returns an empty string.
 *
 * Use everywhere we currently do `toast.error('Failed to …')` so the
 * user sees the actual reason (e.g. "Cannot delete brand X — it has 12
 * associated products") instead of a generic line.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[]; error?: string } | undefined;
    if (data) {
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join(' ');
      }
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
    }
    if (err.message) {
      return err.message;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
