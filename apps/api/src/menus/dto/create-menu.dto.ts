import { IsString, IsOptional, IsEnum, IsNotEmpty, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum MenuLocation {
  HEADER = 'header',
  FOOTER = 'footer',
  SIDEBAR = 'sidebar',
  MOBILE = 'mobile',
}

export enum MenuItemType {
  CUSTOM = 'custom',
  CATEGORY = 'category',
  PAGE = 'page',
  LINK = 'link',
}

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MenuLocation)
  location: MenuLocation;
}

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  labelBn?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(MenuItemType)
  @IsOptional()
  type?: MenuItemType;

  @IsString()
  @IsOptional()
  target?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateMenuItemDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  labelBn?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(MenuItemType)
  @IsOptional()
  type?: MenuItemType;

  @IsString()
  @IsOptional()
  target?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

export class MoveMenuItemDto {
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsOptional()
  position?: 'before' | 'after' | 'child';
}
