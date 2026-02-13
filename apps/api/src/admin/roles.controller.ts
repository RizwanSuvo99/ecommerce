import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RolesService } from './roles.service';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** GET /admin/roles/permissions — list all available permissions */
  @Get('permissions')
  getPermissions() {
    return { data: this.rolesService.getPermissions() };
  }

  @Get()
  async findAll() {
    return { data: await this.rolesService.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.rolesService.findById(id) };
  }

  @Post()
  async create(@Body() dto: CreateRoleDto) {
    return { data: await this.rolesService.create(dto) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return { data: await this.rolesService.update(id, dto) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { data: await this.rolesService.remove(id) };
  }

  /** POST /admin/roles/assign — assign a role to a user */
  @Post('assign')
  async assignRole(@Body() body: { userId: string; roleId: string }) {
    return {
      data: await this.rolesService.assignRole(body.userId, body.roleId),
    };
  }
}
