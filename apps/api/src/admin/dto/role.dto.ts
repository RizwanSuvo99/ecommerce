import { IsArray, IsOptional, IsString } from 'class-validator';

export enum Permission {
  // Products
  PRODUCTS_VIEW = 'products:view',
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_EDIT = 'products:edit',
  PRODUCTS_DELETE = 'products:delete',

  // Orders
  ORDERS_VIEW = 'orders:view',
  ORDERS_EDIT = 'orders:edit',
  ORDERS_CANCEL = 'orders:cancel',

  // Users
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_EDIT = 'users:edit',
  USERS_DELETE = 'users:delete',

  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',

  // Reviews
  REVIEWS_VIEW = 'reviews:view',
  REVIEWS_MODERATE = 'reviews:moderate',

  // Content
  PAGES_VIEW = 'pages:view',
  PAGES_EDIT = 'pages:edit',
  BANNERS_EDIT = 'banners:edit',
  MENUS_EDIT = 'menus:edit',

  // Reports
  REPORTS_VIEW = 'reports:view',
  AUDIT_VIEW = 'audit:view',
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
