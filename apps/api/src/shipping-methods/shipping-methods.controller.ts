import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import {
  CreateShippingMethodInput,
  ShippingMethodsService,
  UpdateShippingMethodInput,
} from './shipping-methods.service';
import { AdminGuard } from '../admin/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/** Public endpoint used by the checkout page to populate method options. */
@Controller('shipping-methods')
export class PublicShippingMethodsController {
  constructor(private readonly service: ShippingMethodsService) {}

  @Get()
  async list() {
    return { data: await this.service.findActive() };
  }
}

/** Admin CRUD. Paired with /admin/settings/shipping (which carries the
 *  cross-method settings like free_shipping_threshold) — the two don't
 *  overlap, so the old settings page is still useful for the non-row
 *  knobs. */
@Controller('admin/shipping-methods')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminShippingMethodsController {
  constructor(private readonly service: ShippingMethodsService) {}

  @Get()
  async list() {
    return { data: await this.service.findAll() };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.service.findOne(id) };
  }

  @Post()
  async create(@Body() input: CreateShippingMethodInput) {
    return { data: await this.service.create(input) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: UpdateShippingMethodInput) {
    return { data: await this.service.update(id, input) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true };
  }

  @Post('reorder')
  async reorder(@Body() body: { items: { id: string; sortOrder: number }[] }) {
    return this.service.reorder(body.items);
  }
}
