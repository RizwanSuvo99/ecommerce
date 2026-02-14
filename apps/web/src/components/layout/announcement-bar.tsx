'use client';

import { useState, useEffect } from 'react';

interface AnnouncementBarProps {
  message?: string;
  messageBn?: string;
  link?: string;
  linkText?: string;
  linkTextBn?: string;
  backgroundColor?: string;
  textColor?: string;
  dismissible?: boolean;
  id?: string;
}

const DEFAULT_ANNOUNCEMENT: AnnouncementBarProps = {
  message: 'Free shipping on orders over ৳2,000! Limited time offer.',
  messageBn: '৳২,০০০ এর বেশি অর্ডারে বিনামূল্যে শিপিং! সীমিত সময়ের অফার।',
  link: '/products',
  linkText: 'Shop Now',
  linkTextBn: 'এখনই কিনুন',
  backgroundColor: '#1e40af',
  textColor: '#ffffff',
  dismissible: true,
  id: 'default-announcement',
};

export function AnnouncementBar(props: AnnouncementBarProps = {}) {
  const config = { ...DEFAULT_ANNOUNCEMENT, ...props };
  const [isVisible, setIsVisible] = useState(false);
  const [locale, setLocale] = useState<'en' | 'bn'>('en');

  const storageKey = `announcement-dismissed-${config.id}`;

  useEffect(() => {
    // Check if user has dismissed this announcement in the current session
    const dismissed = sessionStorage.getItem(storageKey);
    if (!dismissed) {
      setIsVisible(true);
    }

    // Detect locale from the document or URL
    const htmlLang = document.documentElement.lang;
    if (htmlLang === 'bn') {
      setLocale('bn');
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) return null;

  const displayMessage =
    locale === 'bn' && config.messageBn ? config.messageBn : config.message;
  const displayLinkText =
    locale === 'bn' && config.linkTextBn
      ? config.linkTextBn
      : config.linkText;

  return (
    <div
      className="relative w-full py-2.5 px-4 text-center text-sm font-medium transition-all duration-300"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
      role="banner"
      aria-label="Announcement"
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        {/* Animated dot indicator */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: config.textColor }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: config.textColor }}
          />
        </span>

        {/* Message */}
        <p className="inline-flex flex-wrap items-center gap-1">
          <span>{displayMessage}</span>
          {config.link && displayLinkText && (
            <a
              href={config.link}
              className="inline-flex items-center gap-1 underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
            >
              {displayLinkText}
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          )}
        </p>

        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
          className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity border border-current/30 rounded px-1.5 py-0.5"
          aria-label="Toggle language"
        >
          {locale === 'en' ? 'বাং' : 'EN'}
        </button>

        {/* Dismiss button */}
        {config.dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss announcement"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Multiple rotating announcements
 */
export function RotatingAnnouncementBar({
  announcements,
  interval = 5000,
}: {
  announcements: AnnouncementBarProps[];
  interval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, interval);

    return () => clearInterval(timer);
  }, [announcements.length, interval]);

  if (announcements.length === 0) return null;

  return (
    <AnnouncementBar
      {...announcements[currentIndex]}
      id={`rotating-${currentIndex}`}
      dismissible={false}
    />
  );
}
