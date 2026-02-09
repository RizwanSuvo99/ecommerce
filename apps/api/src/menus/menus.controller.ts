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
import { MenusService } from './menus.service';
import { CreateMenuDto, CreateMenuItemDto, UpdateMenuItemDto, MoveMenuItemDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller()
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post('admin/menus')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createMenu(@Body() dto: CreateMenuDto) {
    return this.menusService.createMenu(dto);
  }

  @Get('admin/menus')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllMenus() {
    return this.menusService.findAllMenus();
  }

  @Get('menus/:location')
  findMenuByLocation(@Param('location') location: string) {
    return this.menusService.findMenuByLocation(location);
  }

  @Post('admin/menus/:menuId/items')
  @UseGuards(JwtAuthGuard, AdminGuard)
  addMenuItem(@Param('menuId') menuId: string, @Body() dto: CreateMenuItemDto) {
    return this.menusService.addMenuItem(menuId, dto);
  }

  @Patch('admin/menus/:menuId/items/:itemId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateMenuItem(
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menusService.updateMenuItem(menuId, itemId, dto);
  }

  @Delete('admin/menus/:menuId/items/:itemId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteMenuItem(@Param('menuId') menuId: string, @Param('itemId') itemId: string) {
    return this.menusService.deleteMenuItem(menuId, itemId);
  }

  @Post('admin/menus/:menuId/items/:itemId/move')
  @UseGuards(JwtAuthGuard, AdminGuard)
  moveMenuItem(
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
    @Body() dto: MoveMenuItemDto,
  ) {
    return this.menusService.moveMenuItem(menuId, itemId, dto);
  }

  @Delete('admin/menus/:menuId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteMenu(@Param('menuId') menuId: string) {
    return this.menusService.deleteMenu(menuId);
  }
}
