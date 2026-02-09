import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ColorSettings {
  @IsString() @IsOptional() primary?: string;
  @IsString() @IsOptional() primaryLight?: string;
  @IsString() @IsOptional() primaryDark?: string;
  @IsString() @IsOptional() secondary?: string;
  @IsString() @IsOptional() secondaryLight?: string;
  @IsString() @IsOptional() secondaryDark?: string;
  @IsString() @IsOptional() accent?: string;
  @IsString() @IsOptional() background?: string;
  @IsString() @IsOptional() surface?: string;
  @IsString() @IsOptional() text?: string;
  @IsString() @IsOptional() textSecondary?: string;
  @IsString() @IsOptional() border?: string;
  @IsString() @IsOptional() success?: string;
  @IsString() @IsOptional() warning?: string;
  @IsString() @IsOptional() error?: string;
  @IsString() @IsOptional() info?: string;
}

export class TypographySettings {
  @IsString() @IsOptional() headingFont?: string;
  @IsString() @IsOptional() bodyFont?: string;
  @IsString() @IsOptional() banglaFont?: string;
  @IsString() @IsOptional() monoFont?: string;
  @IsString() @IsOptional() baseFontSize?: string;
  @IsString() @IsOptional() headingWeight?: string;
  @IsString() @IsOptional() bodyWeight?: string;
  @IsString() @IsOptional() lineHeight?: string;
}

export class BorderSettings {
  @IsString() @IsOptional() radius?: string;
  @IsString() @IsOptional() radiusSm?: string;
  @IsString() @IsOptional() radiusMd?: string;
  @IsString() @IsOptional() radiusLg?: string;
  @IsString() @IsOptional() radiusFull?: string;
  @IsString() @IsOptional() width?: string;
  @IsString() @IsOptional() color?: string;
}

export class LayoutSettings {
  @IsString() @IsOptional() headerStyle?: string;
  @IsString() @IsOptional() footerStyle?: string;
  @IsString() @IsOptional() heroStyle?: string;
  @IsString() @IsOptional() productCardStyle?: string;
  @IsString() @IsOptional() containerMaxWidth?: string;
  @IsString() @IsOptional() sidebarPosition?: string;
}

export class UpdateThemeDto {
  @IsObject() @IsOptional()
  @ValidateNested() @Type(() => ColorSettings)
  colors?: ColorSettings;

  @IsObject() @IsOptional()
  @ValidateNested() @Type(() => TypographySettings)
  typography?: TypographySettings;

  @IsObject() @IsOptional()
  @ValidateNested() @Type(() => BorderSettings)
  borders?: BorderSettings;

  @IsObject() @IsOptional()
  @ValidateNested() @Type(() => LayoutSettings)
  layout?: LayoutSettings;

  @IsString() @IsOptional()
  customCSS?: string;

  @IsString() @IsOptional()
  logoUrl?: string;

  @IsString() @IsOptional()
  faviconUrl?: string;
}
