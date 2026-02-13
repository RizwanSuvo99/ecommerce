import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { FacetsService } from './facets.service';
import { ProductFacetsController, SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController, ProductFacetsController],
  providers: [SearchService, FacetsService],
  exports: [SearchService, FacetsService],
})
export class SearchModule {}
