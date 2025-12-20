'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '../lib/utils';

/**
 * Progress — a horizontal bar indicating completion progress.
 *
 * Built on Radix UI's accessible Progress primitive. The `value`
 * prop accepts a number between 0 and 100.
 *
 * @example
 * ```tsx
 * <Progress value={33} />
 * <Progress value={100} className="h-2" />
 *
 * // With label
 * <div className="space-y-1">
 *   <div className="flex justify-between text-sm">
 *     <span>Uploading...</span>
 *     <span>67%</span>
 *   </div>
 *   <Progress value={67} />
 * </div>
 * ```
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
