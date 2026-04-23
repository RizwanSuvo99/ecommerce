'use client';

import * as LucideIcons from 'lucide-react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Searchable icon picker backed by the Lucide icon set the admin
 * already ships. Stores the icon as its lucide name (e.g. "ShoppingBag")
 * so the public site can render it with `<LucideIcon name={..} />` or a
 * dynamic lookup.
 *
 * We don't list every Lucide icon (~1,400) — just a curated subset that
 * covers the common storefront admin needs. This keeps the dropdown
 * scannable and keeps bundle impact small (we're using `* as LucideIcons`
 * for the picker itself but tree-shaking will drop anything not
 * rendered).
 */

// Curated whitelist. Extend as needed — the key is shown in the picker
// header; the value must be an exported Lucide icon name.
const ICON_SET: Record<string, string[]> = {
  Commerce: [
    'ShoppingBag',
    'ShoppingCart',
    'Package',
    'Truck',
    'CreditCard',
    'Wallet',
    'Tag',
    'BadgePercent',
    'Receipt',
    'Gift',
  ],
  Nav: [
    'Home',
    'Menu',
    'Search',
    'Filter',
    'ArrowRight',
    'ArrowLeft',
    'ChevronDown',
    'ChevronUp',
    'Layers',
    'LayoutGrid',
  ],
  Categories: [
    'Shirt',
    'Smartphone',
    'Laptop',
    'Headphones',
    'Watch',
    'Camera',
    'Gamepad2',
    'BookOpen',
    'Sparkles',
    'Baby',
    'Dog',
    'Utensils',
    'Flower2',
    'Car',
    'Bed',
    'Lamp',
  ],
  Status: [
    'CheckCircle',
    'AlertTriangle',
    'Info',
    'XCircle',
    'Clock',
    'Star',
    'Heart',
    'Flame',
    'Zap',
    'Bell',
  ],
  Actions: [
    'Edit',
    'Trash2',
    'Copy',
    'Download',
    'Upload',
    'Share2',
    'Settings',
    'LogOut',
    'Plus',
    'Minus',
  ],
  Social: [
    'Facebook',
    'Instagram',
    'Youtube',
    'Twitter',
    'Linkedin',
    'Github',
    'Mail',
    'Phone',
    'MessageCircle',
  ],
};

export interface IconPickerProps {
  value?: string;
  onChange: (name: string) => void;
  label?: string;
  placeholder?: string;
}

// Cheap type assertion — LucideIcons has dozens of named exports + a
// handful of non-icon helpers (createLucideIcon, icons). The picker only
// ever looks up whitelisted names above, so the indexing is safe.
const Icons = LucideIcons as unknown as Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
>;

export function IconPicker({
  value,
  onChange,
  label,
  placeholder = 'Select an icon…',
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Manual focus-on-open avoids the autoFocus jsx-a11y warning.
  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pairs: Array<[string, string]> = [];
    for (const [group, names] of Object.entries(ICON_SET)) {
      for (const name of names) {
        if (!q || name.toLowerCase().includes(q) || group.toLowerCase().includes(q)) {
          pairs.push([group, name]);
        }
      }
    }
    return pairs;
  }, [query]);

  const Selected = value ? Icons[value] : null;

  return (
    <div className="relative" ref={wrapperRef}>
      {label && <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:border-gray-300"
      >
        <span className="flex items-center gap-2 text-gray-700">
          {Selected ? <Selected className="h-4 w-4" /> : null}
          <span>{value ?? placeholder}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-gray-100 bg-white p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons…"
                className="w-full rounded-md border border-gray-200 pl-8 pr-8 py-1.5 text-sm outline-none focus:border-gray-300"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No icons match <span className="font-medium">{query}</span>
            </div>
          ) : (
            <div className="p-2">
              {groupByFirst(filtered).map(([group, names]) => (
                <div key={group} className="mb-3 last:mb-0">
                  <h4 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {group}
                  </h4>
                  <div className="mt-1 grid grid-cols-8 gap-1">
                    {names.map((name) => {
                      const Icon = Icons[name];
                      if (!Icon) {
                        return null;
                      }
                      const isSelected = name === value;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            onChange(name);
                            setOpen(false);
                            setQuery('');
                          }}
                          className={`flex aspect-square items-center justify-center rounded-md border transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                          aria-label={name}
                          title={name}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function groupByFirst(pairs: Array<[string, string]>): Array<[string, string[]]> {
  const map = new Map<string, string[]>();
  for (const [group, name] of pairs) {
    const list = map.get(group) ?? [];
    list.push(name);
    map.set(group, list);
  }
  return Array.from(map.entries());
}
