import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const spinnerVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

/**
 * Spinner — an animated loading indicator.
 *
 * Uses an SVG circle with a dash-offset animation for a smooth
 * spinning effect. Available in three sizes: `sm`, `md`, and `lg`.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="sm" />
 * <Spinner size="lg" className="text-primary" />
 *
 * // With label
 * <div className="flex items-center gap-2">
 *   <Spinner size="sm" />
 *   <span className="text-sm text-muted-foreground">Loading...</span>
 * </div>
 * ```
 */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(spinnerVariants({ size }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
