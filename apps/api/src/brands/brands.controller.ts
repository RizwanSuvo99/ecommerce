import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Query parameters for brand listing.
 */
class BrandFilterDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;
}

@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // ─── Public Endpoints ───────────────────────────────────────────────────────

  /**
   * List all brands with pagination and optional search.
   * Public endpoint - returns only active brands for storefront.
   */
  @Get()
  @Public()
  async findAll(@Query() filters: BrandFilterDto) {
    return this.brandsService.findAll({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      isActive: true,
    });
  }

  /**
   * Get a single brand by slug.
   * Public endpoint for brand detail pages.
   */
  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  // ─── Admin Endpoints ───────────────────────────────────────────────────────

  /**
   * Create a new brand.
   * Restricted to ADMIN and SUPER_ADMIN roles.
   */
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  /**
   * Update an existing brand by ID.
   * Restricted to ADMIN and SUPER_ADMIN roles.
   */
  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  /**
   * Delete a brand by ID.
   * Cannot delete brands with associated products.
   * Restricted to ADMIN and SUPER_ADMIN roles.
   */
  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.brandsService.delete(id);
  }
}
