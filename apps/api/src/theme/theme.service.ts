import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateThemeDto } from './dto/update-theme.dto';

const DEFAULT_THEME = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    secondaryLight: '#94a3b8',
    secondaryDark: '#475569',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    banglaFont: 'Noto Sans Bengali',
    monoFont: 'JetBrains Mono',
    baseFontSize: '16px',
    headingWeight: '700',
    bodyWeight: '400',
    lineHeight: '1.6',
  },
  borders: {
    radius: '8px',
    radiusSm: '4px',
    radiusMd: '8px',
    radiusLg: '12px',
    radiusFull: '9999px',
    width: '1px',
    color: '#e2e8f0',
  },
  layout: {
    headerStyle: 'default',
    footerStyle: 'default',
    heroStyle: 'slider',
    productCardStyle: 'default',
    containerMaxWidth: '1280px',
    sidebarPosition: 'left',
  },
  customCSS: '',
  logoUrl: '',
  faviconUrl: '',
};

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly THEME_WHERE = { group_key: { group: 'THEME' as const, key: 'config' } };

  async getTheme() {
    const settings = await this.prisma.settings.findUnique({
      where: this.THEME_WHERE,
    });

    if (!settings) {
      return DEFAULT_THEME;
    }

    try {
      const stored = JSON.parse(settings.value);
      return this.mergeWithDefaults(stored);
    } catch {
      return DEFAULT_THEME;
    }
  }

  async updateTheme(dto: UpdateThemeDto) {
    const currentTheme = await this.getTheme();

    const updatedTheme = {
      colors: { ...currentTheme.colors, ...dto.colors },
      typography: { ...currentTheme.typography, ...dto.typography },
      borders: { ...currentTheme.borders, ...dto.borders },
      layout: { ...currentTheme.layout, ...dto.layout },
      customCSS: dto.customCSS !== undefined ? dto.customCSS : currentTheme.customCSS,
      logoUrl: dto.logoUrl !== undefined ? dto.logoUrl : currentTheme.logoUrl,
      faviconUrl: dto.faviconUrl !== undefined ? dto.faviconUrl : currentTheme.faviconUrl,
    };

    await this.prisma.settings.upsert({
      where: this.THEME_WHERE,
      create: {
        group: 'THEME',
        key: 'config',
        value: JSON.stringify(updatedTheme),
      },
      update: {
        value: JSON.stringify(updatedTheme),
      },
    });

    return updatedTheme;
  }

  async resetTheme() {
    await this.prisma.settings.upsert({
      where: this.THEME_WHERE,
      create: {
        group: 'THEME',
        key: 'config',
        value: JSON.stringify(DEFAULT_THEME),
      },
      update: {
        value: JSON.stringify(DEFAULT_THEME),
      },
    });

    return DEFAULT_THEME;
  }

  private mergeWithDefaults(stored: any) {
    return {
      colors: { ...DEFAULT_THEME.colors, ...(stored.colors || {}) },
      typography: { ...DEFAULT_THEME.typography, ...(stored.typography || {}) },
      borders: { ...DEFAULT_THEME.borders, ...(stored.borders || {}) },
      layout: { ...DEFAULT_THEME.layout, ...(stored.layout || {}) },
      customCSS: stored.customCSS || DEFAULT_THEME.customCSS,
      logoUrl: stored.logoUrl || DEFAULT_THEME.logoUrl,
      faviconUrl: stored.faviconUrl || DEFAULT_THEME.faviconUrl,
    };
  }

  generateCSSVariables(theme: any): string {
    const vars: string[] = [];

    // Colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        vars.push(`  --color-${cssKey}: ${value};`);
      });
    }

    // Typography
    if (theme.typography) {
      vars.push(`  --font-heading: '${theme.typography.headingFont}', sans-serif;`);
      vars.push(`  --font-body: '${theme.typography.bodyFont}', sans-serif;`);
      vars.push(`  --font-bangla: '${theme.typography.banglaFont}', sans-serif;`);
      vars.push(`  --font-mono: '${theme.typography.monoFont}', monospace;`);
      vars.push(`  --font-size-base: ${theme.typography.baseFontSize};`);
      vars.push(`  --font-weight-heading: ${theme.typography.headingWeight};`);
      vars.push(`  --font-weight-body: ${theme.typography.bodyWeight};`);
      vars.push(`  --line-height: ${theme.typography.lineHeight};`);
    }

    // Borders
    if (theme.borders) {
      vars.push(`  --border-radius: ${theme.borders.radius};`);
      vars.push(`  --border-radius-sm: ${theme.borders.radiusSm};`);
      vars.push(`  --border-radius-md: ${theme.borders.radiusMd};`);
      vars.push(`  --border-radius-lg: ${theme.borders.radiusLg};`);
      vars.push(`  --border-radius-full: ${theme.borders.radiusFull};`);
      vars.push(`  --border-width: ${theme.borders.width};`);
      vars.push(`  --border-color: ${theme.borders.color};`);
    }

    // Layout
    if (theme.layout) {
      vars.push(`  --container-max-width: ${theme.layout.containerMaxWidth};`);
    }

    return `:root {\n${vars.join('\n')}\n}`;
  }
}
