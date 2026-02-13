import { Controller, Get, Query } from '@nestjs/common';

import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** GET /search?q=keyword&page=1&limit=20&... */
  @Get()
  async search(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('inStock') inStock?: string,
  ) {
    const result = await this.searchService.search({
      query: q ?? '',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      categoryId,
      brandId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: (sortBy as any) ?? 'relevance',
      inStock: inStock === 'true',
    });

    return { data: result };
  }

  /** GET /search/suggest?q=keyword — autocomplete suggestions */
  @Get('suggest')
  async suggest(@Query('q') q: string, @Query('limit') limit?: string) {
    const results = await this.searchService.suggest(
      q ?? '',
      limit ? Number(limit) : 8,
    );

    return { data: results };
  }

  /** GET /search/popular — trending search terms */
  @Get('popular')
  async popular(@Query('limit') limit?: string) {
    const terms = await this.searchService.getPopularSearches(
      limit ? Number(limit) : 10,
    );

    return { data: terms };
  }
}
