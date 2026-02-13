import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, Permission, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Return all available permissions. */
  getPermissions() {
    return Object.entries(Permission).map(([key, value]) => ({
      key,
      value,
      group: value.split(':')[0],
    }));
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { users: { select: { id: true, name: true, email: true } } },
    });

    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) throw new ConflictException('Role name already exists');

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
      },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findById(id);

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.permissions && { permissions: dto.permissions }),
      },
    });
  }

  async remove(id: string) {
    const role = await this.findById(id);

    if (role.users.length > 0) {
      throw new ConflictException(
        'Cannot delete role with assigned users. Reassign users first.',
      );
    }

    await this.prisma.role.delete({ where: { id } });
    return { deleted: true };
  }

  async assignRole(userId: string, roleId: string) {
    await this.findById(roleId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: { id: true, name: true, roleId: true },
    });
  }
}
