import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution.
 *
 * Combines `clsx` for conditional class composition with
 * `tailwind-merge` for deduplicating and resolving conflicting
 * Tailwind utility classes.
 *
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4')          // => 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500')
 * cn('bg-primary', className)       // safe to spread user classes
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
