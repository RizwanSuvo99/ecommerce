import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.bannersService.findAll();
  }

  @Get('banners')
  findActive() {
    return this.bannersService.findActive();
  }

  @Get('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }

  @Post('admin/banners/reorder')
  @UseGuards(JwtAuthGuard, AdminGuard)
  reorder(@Body() body: { positions: { id: string; position: number }[] }) {
    return this.bannersService.reorder(body.positions);
  }
}
