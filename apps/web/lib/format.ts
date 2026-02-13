const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

export type Locale = 'en' | 'bn';

function toBengaliDigits(num: string | number): string {
  return String(num).replace(/[0-9]/g, (d) => BENGALI_DIGITS[parseInt(d)]);
}

function toEnglishDigits(str: string): string {
  return str.replace(/[০-৯]/g, (d) => String(BENGALI_DIGITS.indexOf(d as any)));
}

export function formatNumber(value: number, locale: Locale = 'en'): string {
  if (locale === 'bn') {
    const formatted = value.toLocaleString('en-IN'); // Indian numbering system (same as BD)
    return toBengaliDigits(formatted);
  }
  return value.toLocaleString('en-IN');
}

export function formatPrice(
  amount: number,
  locale: Locale = 'en',
  options?: { showSymbol?: boolean; decimals?: number },
): string {
  const { showSymbol = true, decimals = 0 } = options || {};
  const symbol = showSymbol ? '৳' : '';

  const fixed = amount.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  // Bangladesh uses Indian numbering system (lakh, crore)
  const int = parseInt(intPart).toLocaleString('en-IN');
  const formatted = decPart ? `${int}.${decPart}` : int;

  if (locale === 'bn') {
    return `${symbol}${toBengaliDigits(formatted)}`;
  }

  return `${symbol}${formatted}`;
}

export function formatDate(
  date: string | Date,
  locale: Locale = 'en',
  format: 'short' | 'long' | 'relative' = 'short',
): string {
  const d = new Date(date);

  if (format === 'relative') {
    return formatRelativeDate(d, locale);
  }

  if (locale === 'bn') {
    const day = toBengaliDigits(d.getDate());
    const month = BENGALI_MONTHS[d.getMonth()];
    const year = toBengaliDigits(d.getFullYear());

    if (format === 'long') {
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
      const h12 = hours % 12 || 12;
      return `${day} ${month}, ${year} ${toBengaliDigits(h12)}:${toBengaliDigits(minutes)} ${period}`;
    }

    return `${day} ${month}, ${year}`;
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatRelativeDate(date: Date, locale: Locale): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (locale === 'bn') {
    if (diffSec < 60) return 'এইমাত্র';
    if (diffMin < 60) return `${toBengaliDigits(diffMin)} মিনিট আগে`;
    if (diffHr < 24) return `${toBengaliDigits(diffHr)} ঘণ্টা আগে`;
    if (diffDay < 7) return `${toBengaliDigits(diffDay)} দিন আগে`;
    return formatDate(date, 'bn', 'short');
  }

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date, 'en', 'short');
}

export function formatPhone(phone: string, locale: Locale = 'en'): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    const formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    return locale === 'bn' ? toBengaliDigits(formatted) : formatted;
  }
  return locale === 'bn' ? toBengaliDigits(phone) : phone;
}

export function formatOrderNumber(orderNumber: string, locale: Locale = 'en'): string {
  if (locale === 'bn') {
    return orderNumber.replace(/[0-9]/g, (d) => BENGALI_DIGITS[parseInt(d)]);
  }
  return orderNumber;
}

export function formatPercentage(value: number, locale: Locale = 'en'): string {
  const formatted = value.toFixed(0);
  return locale === 'bn' ? `${toBengaliDigits(formatted)}%` : `${formatted}%`;
}

export { toBengaliDigits, toEnglishDigits };
