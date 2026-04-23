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
} from '@nestjs/common';

import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { AdminGuard } from '../admin/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../common/audit/audit-log.decorator';

@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AuditLog({ entity: 'Banner' })
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.bannersService.findAll();
  }

  @Get('banners')
  findActive(@Query('position') position?: string) {
    return this.bannersService.findActive(position);
  }

  @Get('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AuditLog({ entity: 'Banner' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AuditLog({ entity: 'Banner' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }

  @Post('admin/banners/reorder')
  @UseGuards(JwtAuthGuard, AdminGuard)
  reorder(@Body() body: { positions: { id: string; position: number }[] }) {
    return this.bannersService.reorder(body.positions);
  }
}
