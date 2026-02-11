import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SettingsGroup, SettingsService } from './settings.service';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** GET /admin/settings — all settings grouped */
  @Get()
  async getAll() {
    return { data: await this.settings.getAll() };
  }

  /** GET /admin/settings/:group — one group */
  @Get(':group')
  async getGroup(@Param('group') group: SettingsGroup) {
    return { data: await this.settings.getByGroup(group) };
  }

  /** PUT /admin/settings/:group — upsert a group */
  @Put(':group')
  async updateGroup(
    @Param('group') group: SettingsGroup,
    @Body() body: Record<string, string>,
  ) {
    return { data: await this.settings.updateGroup(group, body) };
  }

  /** DELETE /admin/settings/:group/:key — remove one key */
  @Delete(':group/:key')
  async deleteKey(
    @Param('group') group: SettingsGroup,
    @Param('key') key: string,
  ) {
    await this.settings.delete(group, key);
    return { message: 'Setting deleted' };
  }
}
