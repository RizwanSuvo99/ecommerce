import {
  Injectable,
  NotImplementedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Permission } from './dto/role.dto';

// Hardcoded roles matching the UserRole enum in the Prisma schema.
// Since there is no Role model in the database, we manage roles in-memory.
const ROLE_DEFINITIONS = [
  {
    id: 'role-super-admin',
    name: 'SUPER_ADMIN',
    description: 'Full access to all features and settings',
    permissions: Object.values(Permission),
  },
  {
    id: 'role-admin',
    name: 'ADMIN',
    description: 'Manage products, orders, customers, and content',
    permissions: [
      Permission.PRODUCTS_VIEW, Permission.PRODUCTS_CREATE, Permission.PRODUCTS_EDIT, Permission.PRODUCTS_DELETE,
      Permission.ORDERS_VIEW, Permission.ORDERS_EDIT, Permission.ORDERS_CANCEL,
      Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT,
      Permission.REVIEWS_VIEW, Permission.REVIEWS_MODERATE,
      Permission.PAGES_VIEW, Permission.PAGES_EDIT, Permission.BANNERS_EDIT, Permission.MENUS_EDIT,
      Permission.REPORTS_VIEW, Permission.AUDIT_VIEW,
      Permission.SETTINGS_VIEW,
    ],
  },
  {
    id: 'role-vendor',
    name: 'VENDOR',
    description: 'Manage own products and view orders',
    permissions: [
      Permission.PRODUCTS_VIEW, Permission.PRODUCTS_CREATE, Permission.PRODUCTS_EDIT,
      Permission.ORDERS_VIEW,
      Permission.REVIEWS_VIEW,
      Permission.REPORTS_VIEW,
    ],
  },
  {
    id: 'role-customer',
    name: 'CUSTOMER',
    description: 'Standard customer account',
    permissions: [],
  },
];

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Return all available permissions grouped by module. */
  getPermissions() {
    return Object.entries(Permission).map(([key, value]) => ({
      key,
      value,
      group: value.split(':')[0],
    }));
  }

  async findAll() {
    // Get user counts per role
    const counts = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    const countMap = new Map(counts.map((c) => [c.role, c._count.role]));

    return ROLE_DEFINITIONS.map((role) => ({
      ...role,
      _count: { users: countMap.get(role.name as any) ?? 0 },
    }));
  }

  async findById(id: string) {
    const role = ROLE_DEFINITIONS.find((r) => r.id === id);
    if (!role) {
      // Try matching by name
      const byName = ROLE_DEFINITIONS.find((r) => r.name === id);
      if (!byName) {
        return null;
      }
      return {
        ...byName,
        users: await this.prisma.user.findMany({
          where: { role: byName.name as any },
          take: 20,
          select: { id: true, firstName: true, lastName: true, email: true },
        }),
      };
    }

    return {
      ...role,
      users: await this.prisma.user.findMany({
        where: { role: role.name as any },
        take: 20,
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
    };
  }

  async create() {
    throw new NotImplementedException(
      'Custom roles are not supported. Roles are managed via the UserRole enum.',
    );
  }

  async update() {
    throw new NotImplementedException(
      'Built-in roles cannot be modified. Permissions are predefined per role.',
    );
  }

  async remove() {
    throw new NotImplementedException(
      'Built-in roles cannot be deleted.',
    );
  }

  /** Assign a role to a user by updating their role enum field. */
  async assignRole(userId: string, roleId: string) {
    const role = ROLE_DEFINITIONS.find((r) => r.id === roleId || r.name === roleId);
    if (!role) {
      throw new NotImplementedException('Invalid role');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role.name as any },
      select: { id: true, firstName: true, lastName: true, role: true },
    });
  }
}
