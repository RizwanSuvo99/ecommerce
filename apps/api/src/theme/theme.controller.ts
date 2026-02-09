import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller()
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('theme')
  getTheme() {
    return this.themeService.getTheme();
  }

  @Get('theme/css')
  async getThemeCSS() {
    const theme = await this.themeService.getTheme();
    const css = this.themeService.generateCSSVariables(theme);
    return { css };
  }

  @Patch('admin/theme')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateTheme(@Body() dto: UpdateThemeDto) {
    return this.themeService.updateTheme(dto);
  }

  @Post('admin/theme/reset')
  @UseGuards(JwtAuthGuard, AdminGuard)
  resetTheme() {
    return this.themeService.resetTheme();
  }
}
