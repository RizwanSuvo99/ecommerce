import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Tax calculation result.
 */
export interface TaxCalculation {
  /** Subtotal before tax */
  subtotal: number;
  /** Tax rate as a decimal (e.g. 0.15 for 15%) */
  taxRate: number;
  /** Tax rate as a percentage string */
  taxRateDisplay: string;
  /** Calculated tax amount */
  taxAmount: number;
  /** Total after tax */
  totalWithTax: number;
  /** Whether tax is included in the displayed price */
  taxIncluded: boolean;
  /** Label for the tax (e.g. "VAT 15%") */
  taxLabel: string;
}

/**
 * Tax configuration options.
 */
interface TaxConfig {
  /** VAT rate as a percentage (default: 15) */
  vatRate: number;
  /** Whether prices already include tax (default: true for BD) */
  taxIncluded: boolean;
  /** Tax label to display */
  taxLabel: string;
}

/**
 * Tax calculation service for Bangladesh.
 *
 * Bangladesh imposes a 15% Value Added Tax (VAT) on most goods.
 * This service supports:
 *
 * - Configurable VAT rate (via TAX_VAT_RATE env var)
 * - Tax-included pricing (prices shown already include VAT)
 * - Tax-excluded pricing (VAT added on top of the displayed price)
 * - Toggle between modes via TAX_INCLUDED env var
 */
@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);
  private readonly config: TaxConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      vatRate: this.configService.get<number>('TAX_VAT_RATE', 15),
      taxIncluded: this.configService.get<string>('TAX_INCLUDED', 'true') === 'true',
      taxLabel: this.configService.get<string>('TAX_LABEL', 'VAT'),
    };

    this.logger.log(
      `Tax service initialized: ${this.config.taxLabel} ${this.config.vatRate}%, ` +
      `included=${this.config.taxIncluded}`,
    );
  }

  /**
   * Get the current tax configuration.
   */
  getTaxConfig(): TaxConfig {
    return { ...this.config };
  }

  /**
   * Calculate tax for a given subtotal.
   *
   * If tax is **included** in the price:
   *   - The displayed price already contains VAT
   *   - taxAmount = subtotal - (subtotal / (1 + rate))
   *   - totalWithTax = subtotal (no change)
   *
   * If tax is **excluded** from the price:
   *   - VAT is added on top of the subtotal
   *   - taxAmount = subtotal * rate
   *   - totalWithTax = subtotal + taxAmount
   *
   * @param subtotal - The order subtotal (after discounts, before shipping)
   * @returns Tax calculation breakdown
   */
  calculateTax(subtotal: number): TaxCalculation {
    const rate = this.config.vatRate / 100;

    let taxAmount: number;
    let totalWithTax: number;

    if (this.config.taxIncluded) {
      // Tax is already included in the price
      // Extract the tax component: price = base + (base * rate) = base * (1 + rate)
      // base = price / (1 + rate), tax = price - base
      taxAmount = subtotal - subtotal / (1 + rate);
      totalWithTax = subtotal;
    } else {
      // Tax is added on top
      taxAmount = subtotal * rate;
      totalWithTax = subtotal + taxAmount;
    }

    // Round to 2 decimal places
    taxAmount = Math.round(taxAmount * 100) / 100;
    totalWithTax = Math.round(totalWithTax * 100) / 100;

    const result: TaxCalculation = {
      subtotal,
      taxRate: rate,
      taxRateDisplay: `${this.config.vatRate}%`,
      taxAmount,
      totalWithTax,
      taxIncluded: this.config.taxIncluded,
      taxLabel: `${this.config.taxLabel} ${this.config.vatRate}%`,
    };

    this.logger.debug(
      `Tax calculated: subtotal=৳${subtotal}, tax=৳${taxAmount}, ` +
      `total=৳${totalWithTax}, included=${this.config.taxIncluded}`,
    );

    return result;
  }

  /**
   * Calculate tax for an order with shipping.
   *
   * Shipping costs in Bangladesh are typically VAT-exempt,
   * so tax is only applied to the product subtotal.
   *
   * @param subtotal - Product subtotal (after discounts)
   * @param shippingCost - Shipping cost (VAT-exempt)
   * @returns Tax calculation with order total including shipping
   */
  calculateOrderTax(
    subtotal: number,
    shippingCost: number,
  ): TaxCalculation & { shippingCost: number; orderTotal: number } {
    const taxCalc = this.calculateTax(subtotal);

    const orderTotal = taxCalc.totalWithTax + shippingCost;

    return {
      ...taxCalc,
      shippingCost,
      orderTotal: Math.round(orderTotal * 100) / 100,
    };
  }
}
