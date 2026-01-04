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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product.
   * Restricted to ADMIN and SUPER_ADMIN roles.
   */
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.create(createProductDto);
  }

  /**
   * List products with pagination, sorting, and filtering.
   * Public endpoint - no authentication required.
   */
  @Get()
  @Public()
  async findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  /**
   * Get a single product by slug with full details.
   * Public endpoint - no authentication required.
   * Increments view count on each access.
   */
  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /**
   * Update an existing product by ID.
   * Restricted to ADMIN and SUPER_ADMIN roles.
   */
  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Delete a product by ID.
   * By default, this archives the product (soft delete).
   * Pass ?permanent=true to permanently delete (SUPER_ADMIN only).
   */
  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @Query('permanent') permanent: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (permanent === 'true') {
      // Only SUPER_ADMIN can permanently delete
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can permanently delete products');
      }
      return this.productsService.permanentDelete(id);
    }

    return this.productsService.archive(id);
  }
}
