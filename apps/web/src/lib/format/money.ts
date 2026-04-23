/**
 * Admin-controlled money formatter. Consolidates the scattered
 * formatBDT / formatPrice helpers in the codebase so currency symbol
 * and position come from a single source (public settings) rather than
 * being hardcoded to "৳" in ~15 files.
 *
 * Usage:
 *   Server: const money = await makeMoneyFormatter();
 *   Client: pass { symbol, position } from getSiteConfig through props.
 *
 * The returned formatter uses Intl.NumberFormat for locale-correct
 * thousands separators and is stable across locales — the symbol /
 * position wrap the base formatted number.
 */

export interface MoneyFormatOptions {
  /** Currency symbol, e.g. "৳" or "$". From settings.general.currency_symbol. */
  symbol?: string;
  /** "before" → "৳1,200", "after" → "1,200 ৳". From settings.general.currency_position. */
  position?: 'before' | 'after';
  /** BCP 47 locale for digit grouping. Defaults to 'en-BD'. */
  locale?: string;
  /** Minimum fraction digits. Defaults to 0 to match the current UI. */
  minimumFractionDigits?: number;
  /** Maximum fraction digits. Defaults to 0. */
  maximumFractionDigits?: number;
}

export type MoneyFormatter = (amount: number) => string;

export function createMoneyFormatter(options: MoneyFormatOptions = {}): MoneyFormatter {
  const symbol = options.symbol ?? '৳';
  const position = options.position ?? 'before';
  const nf = new Intl.NumberFormat(options.locale ?? 'en-BD', {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  });

  return (amount: number): string => {
    if (!Number.isFinite(amount)) {
      return position === 'before' ? `${symbol}0` : `0 ${symbol}`;
    }
    const n = nf.format(amount);
    return position === 'before' ? `${symbol}${n}` : `${n} ${symbol}`;
  };
}

/**
 * Convenience one-shot for call sites that don't need to hold the
 * formatter instance. For perf-sensitive loops, hoist
 * `createMoneyFormatter(...)` once and reuse.
 */
export function formatMoney(amount: number, options: MoneyFormatOptions = {}): string {
  return createMoneyFormatter(options)(amount);
}

/**
 * Build a formatter from the public-settings slice the storefront fetches
 * on every SSR. Kept separate from `createMoneyFormatter` so callers
 * don't have to import the settings type to construct a formatter.
 */
export function moneyFromSettings(general: {
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
}): MoneyFormatter {
  return createMoneyFormatter({
    symbol: general.currency_symbol,
    position: general.currency_position,
  });
}
