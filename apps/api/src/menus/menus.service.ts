import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto, CreateMenuItemDto, UpdateMenuItemDto, MoveMenuItemDto } from './dto/create-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async createMenu(dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: {
        name: dto.name,
        location: dto.location,
      },
    });
  }

  async findAllMenus() {
    const menus = await this.prisma.menu.findMany({
      include: {
        items: {
          where: { parentId: null },
          orderBy: { position: 'asc' },
          include: {
            children: {
              orderBy: { position: 'asc' },
              include: {
                children: {
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return { menus };
  }

  async findMenuByLocation(location: string) {
    const menu = await this.prisma.menu.findFirst({
      where: { location },
      include: {
        items: {
          where: { parentId: null, isVisible: true },
          orderBy: { position: 'asc' },
          include: {
            children: {
              where: { isVisible: true },
              orderBy: { position: 'asc' },
              include: {
                children: {
                  where: { isVisible: true },
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with location "${location}" not found`);
    }

    return menu;
  }

  async addMenuItem(menuId: string, dto: CreateMenuItemDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException(`Menu not found`);

    const maxPos = await this.prisma.menuItem.aggregate({
      where: { menuId, parentId: dto.parentId || null },
      _max: { position: true },
    });

    return this.prisma.menuItem.create({
      data: {
        label: dto.label,
        labelBn: dto.labelBn,
        url: dto.url || '',
        type: dto.type || 'custom',
        target: dto.target || '_self',
        icon: dto.icon || '',
        isVisible: dto.isVisible ?? true,
        position: (maxPos._max.position ?? -1) + 1,
        menuId,
        parentId: dto.parentId || null,
      },
    });
  }

  async updateMenuItem(menuId: string, itemId: string, dto: UpdateMenuItemDto) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    });

    if (!item) throw new NotFoundException(`Menu item not found`);

    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async deleteMenuItem(menuId: string, itemId: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    });

    if (!item) throw new NotFoundException(`Menu item not found`);

    // Delete children first
    await this.prisma.menuItem.deleteMany({
      where: { parentId: itemId },
    });

    return this.prisma.menuItem.delete({ where: { id: itemId } });
  }

  async moveMenuItem(menuId: string, itemId: string, dto: MoveMenuItemDto) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    });

    if (!item) throw new NotFoundException(`Menu item not found`);

    const target = await this.prisma.menuItem.findFirst({
      where: { id: dto.targetId, menuId },
    });

    if (!target) throw new NotFoundException(`Target menu item not found`);

    if (dto.position === 'child') {
      // Move as child of target
      const maxPos = await this.prisma.menuItem.aggregate({
        where: { menuId, parentId: dto.targetId },
        _max: { position: true },
      });

      await this.prisma.menuItem.update({
        where: { id: itemId },
        data: {
          parentId: dto.targetId,
          position: (maxPos._max.position ?? -1) + 1,
        },
      });
    } else {
      // Move before or after target at same level
      await this.prisma.menuItem.update({
        where: { id: itemId },
        data: {
          parentId: target.parentId,
          position: dto.position === 'before' ? target.position : target.position + 1,
        },
      });

      // Reorder siblings
      const siblings = await this.prisma.menuItem.findMany({
        where: {
          menuId,
          parentId: target.parentId,
          id: { not: itemId },
        },
        orderBy: { position: 'asc' },
      });

      const updates = siblings.map((s, i) =>
        this.prisma.menuItem.update({
          where: { id: s.id },
          data: { position: i >= (dto.position === 'before' ? target.position : target.position + 1) ? i + 1 : i },
        }),
      );

      await this.prisma.$transaction(updates);
    }

    return { success: true };
  }

  async deleteMenu(menuId: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException(`Menu not found`);

    await this.prisma.menuItem.deleteMany({ where: { menuId } });
    return this.prisma.menu.delete({ where: { id: menuId } });
  }
}
