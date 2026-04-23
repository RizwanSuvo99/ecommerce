import { Module } from '@nestjs/common';

import {
  AdminShippingMethodsController,
  PublicShippingMethodsController,
} from './shipping-methods.controller';
import { ShippingMethodsService } from './shipping-methods.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicShippingMethodsController, AdminShippingMethodsController],
  providers: [ShippingMethodsService],
  exports: [ShippingMethodsService],
})
export class ShippingMethodsModule {}
