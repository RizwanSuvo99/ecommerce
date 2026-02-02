'use client';

import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

// ──────────────────────────────────────────────────────────
// Presets
// ──────────────────────────────────────────────────────────

type PresetKey = '7d' | '30d' | '90d' | 'year';

const presets: { key: PresetKey; label: string }[] = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'year', label: 'This Year' },
];

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getPresetRange(key: PresetKey): DateRange {
  const now = new Date();
  const endDate = toDateString(now);

  switch (key) {
    case '7d': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: toDateString(start), endDate };
    }
    case '30d': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: toDateString(start), endDate };
    }
    case '90d': {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { startDate: toDateString(start), endDate };
    }
    case 'year': {
      return { startDate: `${now.getFullYear()}-01-01`, endDate };
    }
  }
}

function getActivePreset(value: DateRange): PresetKey | null {
  for (const preset of presets) {
    const range = getPresetRange(preset.key);
    if (range.startDate === value.startDate && range.endDate === value.endDate) {
      return preset.key;
    }
  }
  return null;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const activePreset = getActivePreset(value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.key}
          onClick={() => onChange(getPresetRange(preset.key))}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            activePreset === preset.key
              ? 'border-teal-600 bg-teal-600 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
          )}
        >
          {preset.label}
        </button>
      ))}

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <span>to</span>
        <input
          type="date"
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}
