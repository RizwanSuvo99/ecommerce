import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Shipping zone definitions for Bangladesh.
 */
export enum ShippingZone {
  INSIDE_DHAKA = 'INSIDE_DHAKA',
  OUTSIDE_DHAKA = 'OUTSIDE_DHAKA',
}

/**
 * Shipping method with cost and delivery estimate.
 */
export interface ShippingMethod {
  id: string;
  name: string;
  zone: ShippingZone;
  cost: number;
  estimatedDays: string;
  freeAbove: number;
  isFree: boolean;
}

/**
 * Shipping cost calculation result.
 */
export interface ShippingCalculation {
  zone: ShippingZone;
  methods: ShippingMethod[];
  subtotal: number;
  qualifiesForFreeShipping: boolean;
}

/**
 * Shipping rates configuration.
 *
 * - Inside Dhaka: ৳60 (standard), free above ৳2000
 * - Outside Dhaka: ৳120 (standard), free above ৳2000
 */
const SHIPPING_RATES = {
  [ShippingZone.INSIDE_DHAKA]: {
    standard: 60,
    express: 120,
  },
  [ShippingZone.OUTSIDE_DHAKA]: {
    standard: 120,
    express: 200,
  },
};

/**
 * Minimum order amount for free shipping (in BDT).
 */
const FREE_SHIPPING_THRESHOLD = 2000;

/**
 * Districts within Dhaka division that qualify for "Inside Dhaka" shipping.
 */
const DHAKA_DISTRICTS = [
  'Dhaka',
  'Gazipur',
  'Narayanganj',
  'Munshiganj',
  'Manikganj',
  'Narsingdi',
];

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Determine the shipping zone based on the address district.
   */
  getShippingZone(district: string): ShippingZone {
    const normalized = district.trim();

    if (DHAKA_DISTRICTS.some((d) => d.toLowerCase() === normalized.toLowerCase())) {
      return ShippingZone.INSIDE_DHAKA;
    }

    return ShippingZone.OUTSIDE_DHAKA;
  }

  /**
   * Calculate shipping cost for a given address.
   *
   * Fetches the user's address by ID, determines the shipping zone,
   * and returns available shipping methods with costs. Orders above
   * ৳2000 qualify for free standard shipping.
   *
   * GET /shipping/calculate?addressId=x
   */
  async calculateShipping(
    addressId: string,
    userId?: string,
  ): Promise<ShippingCalculation> {
    // Fetch the address (for guests, userId may be null)
    const where: any = { id: addressId };
    if (userId) where.userId = userId;

    const address = await this.prisma.address.findFirst({ where });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Determine the shipping zone
    const zone = this.getShippingZone(address.district);
    const rates = SHIPPING_RATES[zone];

    // Fetch the user's cart to calculate subtotal
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: { select: { price: true } } },
        },
      },
    });

    const subtotal = (cart?.items || []).reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    // Build shipping methods
    const methods: ShippingMethod[] = [
      {
        id: 'standard',
        name: zone === ShippingZone.INSIDE_DHAKA
          ? 'Standard Delivery (Inside Dhaka)'
          : 'Standard Delivery (Outside Dhaka)',
        zone,
        cost: qualifiesForFreeShipping ? 0 : rates.standard,
        estimatedDays: zone === ShippingZone.INSIDE_DHAKA ? '1-2 days' : '3-5 days',
        freeAbove: FREE_SHIPPING_THRESHOLD,
        isFree: qualifiesForFreeShipping,
      },
      {
        id: 'express',
        name: zone === ShippingZone.INSIDE_DHAKA
          ? 'Express Delivery (Inside Dhaka)'
          : 'Express Delivery (Outside Dhaka)',
        zone,
        cost: rates.express,
        estimatedDays: zone === ShippingZone.INSIDE_DHAKA ? 'Same day' : '1-2 days',
        freeAbove: 0,
        isFree: false,
      },
    ];

    this.logger.debug(
      `Shipping calculated for ${address.district}: zone=${zone}, subtotal=৳${subtotal}, freeShipping=${qualifiesForFreeShipping}`,
    );

    return {
      zone,
      methods,
      subtotal,
      qualifiesForFreeShipping,
    };
  }

  /**
   * Calculate shipping methods by division name (for guests without a saved address).
   */
  calculateShippingByDivision(division: string): Omit<ShippingCalculation, 'subtotal'> & { subtotal: number } {
    const zone = DHAKA_DISTRICTS.some(
      (d) => d.toLowerCase() === division.trim().toLowerCase(),
    )
      ? ShippingZone.INSIDE_DHAKA
      : ShippingZone.OUTSIDE_DHAKA;

    const rates = SHIPPING_RATES[zone];

    const methods: ShippingMethod[] = [
      {
        id: 'standard',
        name: zone === ShippingZone.INSIDE_DHAKA
          ? 'Standard Delivery (Inside Dhaka)'
          : 'Standard Delivery (Outside Dhaka)',
        zone,
        cost: rates.standard,
        estimatedDays: zone === ShippingZone.INSIDE_DHAKA ? '1-2 days' : '3-5 days',
        freeAbove: FREE_SHIPPING_THRESHOLD,
        isFree: false,
      },
      {
        id: 'express',
        name: zone === ShippingZone.INSIDE_DHAKA
          ? 'Express Delivery (Inside Dhaka)'
          : 'Express Delivery (Outside Dhaka)',
        zone,
        cost: rates.express,
        estimatedDays: zone === ShippingZone.INSIDE_DHAKA ? 'Same day' : '1-2 days',
        freeAbove: 0,
        isFree: false,
      },
    ];

    return { zone, methods, subtotal: 0, qualifiesForFreeShipping: false };
  }
}
