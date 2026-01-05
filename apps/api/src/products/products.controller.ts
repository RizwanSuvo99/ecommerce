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
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CreateVariantDto, UpdateVariantDto } from './dto/create-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

/**
 * DTO for adding an image to a product.
 * In production, this would be handled via multipart form upload.
 */
class AddImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  alt?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  height?: number;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsString()
  @IsOptional()
  blurHash?: string;
}

class ReorderImagesDto {
  @IsArray()
  @IsString({ each: true })
  imageIds: string[];
}

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Product Endpoints ──────────────────────────────────────────────────────

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
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can permanently delete products');
      }
      return this.productsService.permanentDelete(id);
    }

    return this.productsService.archive(id);
  }

  // ─── Variant Endpoints ──────────────────────────────────────────────────────

  /**
   * Create a new variant for a product.
   */
  @Post(':id/variants')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('id') productId: string,
    @Body() createVariantDto: CreateVariantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.createVariant(productId, createVariantDto);
  }

  /**
   * Update an existing variant.
   */
  @Patch(':id/variants/:variantId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.updateVariant(productId, variantId, updateVariantDto);
  }

  /**
   * Delete a variant from a product.
   */
  @Delete(':id/variants/:variantId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async deleteVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.deleteVariant(productId, variantId);
  }

  // ─── Image Endpoints ───────────────────────────────────────────────────────

  /**
   * Add an image to a product.
   * In production, this endpoint would accept multipart/form-data
   * and handle file upload to a cloud storage service.
   * Currently accepts image metadata (URL) as a placeholder.
   */
  @Post(':id/images')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async addImage(
    @Param('id') productId: string,
    @Body() addImageDto: AddImageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.addImage(productId, addImageDto);
  }

  /**
   * Remove an image from a product.
   */
  @Delete(':id/images/:imageId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async removeImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.removeImage(productId, imageId);
  }

  /**
   * Reorder images for a product.
   * Accepts an array of image IDs in the desired display order.
   */
  @Patch(':id/images/reorder')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async reorderImages(
    @Param('id') productId: string,
    @Body() reorderDto: ReorderImagesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.reorderImages(productId, reorderDto.imageIds);
  }
}
