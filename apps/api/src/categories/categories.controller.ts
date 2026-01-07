import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Get all categories in a tree structure.
   * Public endpoint - used for navigation menus and category browsing.
   */
  @Get()
  @Public()
  async findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * Get all categories in a flat list with depth information.
   * Useful for dropdown selects in admin forms.
   */
  @Get('flat')
  @Public()
  async findFlat() {
    return this.categoriesService.findFlat();
  }
}
