import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiService } from './ai.service';
import { ProductContextService } from './product-context.service';
import { SearchModule } from '../search/search.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    ConfigModule,
    SearchModule,
    ProductsModule,
    CategoriesModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, AiService, ProductContextService],
})
export class ChatModule {}
