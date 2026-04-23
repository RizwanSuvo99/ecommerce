import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';

import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemeService } from './theme.service';
import { AdminGuard } from '../admin/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../common/audit/audit-log.decorator';

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
  @AuditLog({ entity: 'Theme' })
  updateTheme(@Body() dto: UpdateThemeDto) {
    return this.themeService.updateTheme(dto);
  }

  @Post('admin/theme/reset')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AuditLog({ entity: 'Theme', action: 'RESET' })
  resetTheme() {
    return this.themeService.resetTheme();
  }
}
