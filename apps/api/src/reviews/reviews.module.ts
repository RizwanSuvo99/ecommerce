import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ReviewsAdminController } from './reviews-admin.controller';
import { ReviewsAdminService } from './reviews-admin.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController, ReviewsAdminController],
  providers: [ReviewsService, ReviewsAdminService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
