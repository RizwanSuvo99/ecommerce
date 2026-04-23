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
  Req,
} from '@nestjs/common';

import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';
import { AdminGuard } from '../admin/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../common/audit/audit-log.decorator';

@Controller()
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post('admin/pages')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AuditLog({ entity: 'Page' })
  create(@Body() dto: CreatePageDto, @Req() req: any) {
    return this.pagesService.create(dto, req.user.id);
  }

  @Get('admin/pages')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pagesService.findAll({
      search,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('admin/pages/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Get('pages/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Patch('admin/pages/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AuditLog({ entity: 'Page' })
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete('admin/pages/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AuditLog({ entity: 'Page' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
