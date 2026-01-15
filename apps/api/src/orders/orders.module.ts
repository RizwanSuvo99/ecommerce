import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShippingService } from './shipping.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, ShippingService],
  exports: [OrdersService, ShippingService],
})
export class OrdersModule {}
