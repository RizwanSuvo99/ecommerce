'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const LOCALES = [
  { code: 'en', label: 'English', flag: '🇺🇸', shortLabel: 'EN' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩', shortLabel: 'বাং' },
] as const;

interface LocaleSwitcherProps {
  variant?: 'dropdown' | 'inline';
  className?: string;
}

export function LocaleSwitcher({ variant = 'dropdown', className = '' }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    if (LOCALES.some((l) => l.code === segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {LOCALES.map((loc) => (
          <button
            key={loc.code}
            onClick={() => switchLocale(loc.code)}
            className={`rounded px-2 py-1 text-sm transition-colors ${
              locale === loc.code
                ? 'bg-teal-100 font-medium text-teal-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {loc.flag} {loc.shortLabel}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors hover:bg-gray-50"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <span>{currentLocale.flag}</span>
        <span className="hidden sm:inline">{currentLocale.label}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => switchLocale(loc.code)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                locale === loc.code
                  ? 'bg-teal-50 font-medium text-teal-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{loc.flag}</span>
              <span>{loc.label}</span>
              {locale === loc.code && (
                <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
