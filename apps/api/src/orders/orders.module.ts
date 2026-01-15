import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShippingService } from './shipping.service';
import { TaxService } from './tax.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, ShippingService, TaxService],
  exports: [OrdersService, ShippingService, TaxService],
})
export class OrdersModule {}
