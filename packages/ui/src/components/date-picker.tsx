'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface DatePickerProps {
  /** The currently selected date. */
  value?: Date;
  /** Callback when the date changes. */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder text shown when no date is selected. */
  placeholder?: string;
  /** Date format string (date-fns format). Defaults to `PPP`. */
  dateFormat?: string;
  /** Whether the picker is disabled. */
  disabled?: boolean;
  /** Additional class names for the trigger button. */
  className?: string;
  /**
   * Dates to disable. Can be an array of dates, a function, or
   * any matcher accepted by react-day-picker.
   */
  disabledDates?: React.ComponentProps<typeof Calendar>['disabled'];
}

/**
 * DatePicker — a date selection input using a popover calendar.
 *
 * Combines the `Button`, `Popover`, and `Calendar` components into
 * a single, easy-to-use date picker.
 *
 * @example
 * ```tsx
 * const [date, setDate] = React.useState<Date>();
 *
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   placeholder="Pick a date"
 * />
 *
 * // With disabled dates
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   disabledDates={{ before: new Date() }}
 * />
 * ```
 */
function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  dateFormat = 'PPP',
  disabled = false,
  className,
  disabledDates,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      onChange?.(date);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabledDates}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
DatePicker.displayName = 'DatePicker';

export { DatePicker };
