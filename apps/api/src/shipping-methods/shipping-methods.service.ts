import { Injectable, NotFoundException } from '@nestjs/common';

import { RevalidateService } from '../common/revalidate/revalidate.service';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateShippingMethodInput {
  name: string;
  nameBn?: string;
  description?: string;
  price: number;
  freeAbove?: number;
  estimatedDays?: string;
  zones?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateShippingMethodInput = Partial<CreateShippingMethodInput>;

/**
 * CRUD over the ShippingMethod rows. The model existed and was seeded
 * (Inside Dhaka, Outside Dhaka, Express), but the only admin UI was
 * /admin/settings/shipping which writes flat key-value settings — the
 * actual rows couldn't be edited. Checkout reads from this service so
 * adding a row here makes it immediately pickable at checkout.
 */
@Injectable()
export class ShippingMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  /** Public list, used by checkout; filters to active methods only. */
  async findActive() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    });
  }

  async findAll() {
    return this.prisma.shippingMethod.findMany({
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({
      where: { id },
    });
    if (!method) {
      throw new NotFoundException(`Shipping method "${id}" not found`);
    }
    return method;
  }

  async create(input: CreateShippingMethodInput) {
    const max = await this.prisma.shippingMethod.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = input.sortOrder ?? (max._max.sortOrder ?? -1) + 1;

    const method = await this.prisma.shippingMethod.create({
      data: {
        name: input.name,
        nameBn: input.nameBn,
        description: input.description,
        price: input.price,
        freeAbove: input.freeAbove,
        estimatedDays: input.estimatedDays,
        zones: input.zones ?? [],
        isActive: input.isActive ?? true,
        sortOrder,
      },
    });
    void this.revalidate.revalidate({ tags: ['shipping-methods'] });
    return method;
  }

  async update(id: string, input: UpdateShippingMethodInput) {
    await this.findOne(id);
    const method = await this.prisma.shippingMethod.update({
      where: { id },
      data: input,
    });
    void this.revalidate.revalidate({ tags: ['shipping-methods'] });
    return method;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.shippingMethod.delete({ where: { id } });
    void this.revalidate.revalidate({ tags: ['shipping-methods'] });
    return deleted;
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.shippingMethod.update({
          where: { id: it.id },
          data: { sortOrder: it.sortOrder },
        }),
      ),
    );
    void this.revalidate.revalidate({ tags: ['shipping-methods'] });
    return { success: true };
  }
}
