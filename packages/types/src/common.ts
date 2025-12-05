// ──────────────────────────────────────────────────────────
// Common / shared types — used across all services
// ──────────────────────────────────────────────────────────

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface SortInput {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    stack?: string;
  };
  timestamp: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface FileUpload {
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;
