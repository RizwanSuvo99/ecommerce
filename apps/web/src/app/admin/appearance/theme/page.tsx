'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api/client';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  banglaFont: string;
  monoFont: string;
  baseFontSize: string;
  headingWeight: string;
  bodyWeight: string;
  lineHeight: string;
}

interface ThemeBorders {
  radius: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusFull: string;
  width: string;
  color: string;
}

interface ThemeLayout {
  headerStyle: string;
  footerStyle: string;
  heroStyle: string;
  productCardStyle: string;
  containerMaxWidth: string;
  sidebarPosition: string;
}

interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  borders: ThemeBorders;
  layout: ThemeLayout;
  customCSS: string;
  logoUrl: string;
  faviconUrl: string;
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  primary: 'Primary',
  primaryLight: 'Primary Light',
  primaryDark: 'Primary Dark',
  secondary: 'Secondary',
  secondaryLight: 'Secondary Light',
  secondaryDark: 'Secondary Dark',
  accent: 'Accent',
  background: 'Background',
  surface: 'Surface',
  text: 'Text',
  textSecondary: 'Text Secondary',
  border: 'Border',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
};

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Nunito',
  'Montserrat',
  'Raleway',
  'Source Sans Pro',
];

const BANGLA_FONT_OPTIONS = [
  'Noto Sans Bengali',
  'Hind Siliguri',
  'Baloo Da 2',
  'Anek Bangla',
];

export default function AdminThemePage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'borders' | 'layout' | 'advanced'>('colors');

  useEffect(() => {
    async function loadTheme() {
      try {
        const { data } = await apiClient.get('/theme');
        setTheme(data.data ?? data);
      } catch {
        toast.error('Failed to load theme');
      } finally {
        setLoading(false);
      }
    }
    loadTheme();
  }, []);

  const saveTheme = async () => {
    if (!theme) return;
    setSaving(true);
    try {
      const { data } = await apiClient.patch('/admin/theme', theme);
      setTheme(data.data ?? data);
      toast.success('Theme saved successfully');
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const resetTheme = async () => {
    if (!confirm('Reset theme to defaults? All customizations will be lost.')) return;
    setSaving(true);
    try {
      const { data } = await apiClient.post('/admin/theme/reset');
      setTheme(data.data ?? data);
      toast.success('Theme reset to defaults');
    } catch {
      toast.error('Failed to reset theme');
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    if (!theme) return;
    setTheme({ ...theme, colors: { ...theme.colors, [key]: value } });
  };

  const updateTypography = (key: keyof ThemeTypography, value: string) => {
    if (!theme) return;
    setTheme({ ...theme, typography: { ...theme.typography, [key]: value } });
  };

  const updateBorders = (key: keyof ThemeBorders, value: string) => {
    if (!theme) return;
    setTheme({ ...theme, borders: { ...theme.borders, [key]: value } });
  };

  const updateLayout = (key: keyof ThemeLayout, value: string) => {
    if (!theme) return;
    setTheme({ ...theme, layout: { ...theme.layout, [key]: value } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!theme) {
    return <div className="text-center py-12 text-gray-500">Failed to load theme configuration.</div>;
  }

  const tabs = [
    { id: 'colors' as const, label: 'Colors' },
    { id: 'typography' as const, label: 'Typography' },
    { id: 'borders' as const, label: 'Borders' },
    { id: 'layout' as const, label: 'Layout' },
    { id: 'advanced' as const, label: 'Advanced' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Customize colors, typography, and layout</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetTheme}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button
            onClick={saveTheme}
            disabled={saving}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.entries(COLOR_LABELS) as [keyof ThemeColors, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-9 w-9 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 rounded-lg border border-gray-200" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: theme.colors.primary }}>
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: theme.colors.secondary }}>
                Secondary
              </button>
              <button className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: theme.colors.accent }}>
                Accent
              </button>
              <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: theme.colors.success }}>Success</span>
              <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: theme.colors.error }}>Error</span>
            </div>
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Typography</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
              <select
                value={theme.typography.headingFont}
                onChange={(e) => updateTypography('headingFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
              <select
                value={theme.typography.bodyFont}
                onChange={(e) => updateTypography('bodyFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bangla Font</label>
              <select
                value={theme.typography.banglaFont}
                onChange={(e) => updateTypography('banglaFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {BANGLA_FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Font Size</label>
              <select
                value={theme.typography.baseFontSize}
                onChange={(e) => updateTypography('baseFontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {['14px', '15px', '16px', '17px', '18px'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Weight</label>
              <select
                value={theme.typography.headingWeight}
                onChange={(e) => updateTypography('headingWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {['400', '500', '600', '700', '800'].map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line Height</label>
              <select
                value={theme.typography.lineHeight}
                onChange={(e) => updateTypography('lineHeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {['1.4', '1.5', '1.6', '1.7', '1.8'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Typography Preview */}
          <div className="mt-6 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <h2 style={{ fontFamily: theme.typography.headingFont, fontWeight: Number(theme.typography.headingWeight) }} className="text-xl text-gray-900 mb-1">
              Heading Text Preview
            </h2>
            <p style={{ fontFamily: theme.typography.bodyFont, fontSize: theme.typography.baseFontSize, lineHeight: theme.typography.lineHeight }} className="text-gray-600">
              Body text preview. This is how your content will look with the selected typography settings.
            </p>
            <p style={{ fontFamily: theme.typography.banglaFont, fontSize: theme.typography.baseFontSize }} className="text-gray-600 mt-1">
              বাংলা টেক্সট প্রিভিউ। এই হল আপনার বাংলা কন্টেন্ট।
            </p>
          </div>
        </div>
      )}

      {/* Borders Tab */}
      {activeTab === 'borders' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Borders & Radius</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([
              ['radius', 'Default Radius'],
              ['radiusSm', 'Small Radius'],
              ['radiusMd', 'Medium Radius'],
              ['radiusLg', 'Large Radius'],
              ['width', 'Border Width'],
            ] as [keyof ThemeBorders, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={theme.borders[key]}
                  onChange={(e) => updateBorders(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.borders.color}
                  onChange={(e) => updateBorders('color', e.target.value)}
                  className="h-9 w-9 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.borders.color}
                  onChange={(e) => updateBorders('color', e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Border Preview */}
          <div className="mt-6 flex gap-4">
            {(['radiusSm', 'radiusMd', 'radiusLg'] as (keyof ThemeBorders)[]).map((key) => (
              <div
                key={key}
                className="w-24 h-24 flex items-center justify-center text-xs text-gray-500"
                style={{
                  borderRadius: theme.borders[key],
                  border: `${theme.borders.width} solid ${theme.borders.color}`,
                  backgroundColor: theme.colors.surface,
                }}
              >
                {key}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Layout Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Style</label>
              <select
                value={theme.layout.headerStyle}
                onChange={(e) => updateLayout('headerStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="default">Default</option>
                <option value="centered">Centered</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer Style</label>
              <select
                value={theme.layout.footerStyle}
                onChange={(e) => updateLayout('footerStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="default">Default</option>
                <option value="minimal">Minimal</option>
                <option value="expanded">Expanded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Style</label>
              <select
                value={theme.layout.heroStyle}
                onChange={(e) => updateLayout('heroStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="slider">Slider</option>
                <option value="static">Static</option>
                <option value="video">Video</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Card Style</label>
              <select
                value={theme.layout.productCardStyle}
                onChange={(e) => updateLayout('productCardStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="default">Default</option>
                <option value="compact">Compact</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Container Max Width</label>
              <select
                value={theme.layout.containerMaxWidth}
                onChange={(e) => updateLayout('containerMaxWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="1024px">1024px</option>
                <option value="1152px">1152px</option>
                <option value="1280px">1280px (Default)</option>
                <option value="1440px">1440px</option>
                <option value="1536px">1536px</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Position</label>
              <select
                value={theme.layout.sidebarPosition}
                onChange={(e) => updateLayout('sidebarPosition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Logo & Favicon */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={theme.logoUrl}
                  onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {theme.logoUrl && (
                  <img src={theme.logoUrl} alt="Logo preview" className="mt-2 h-12 object-contain" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                <input
                  type="text"
                  value={theme.faviconUrl}
                  onChange={(e) => setTheme({ ...theme, faviconUrl: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom CSS</h2>
            <textarea
              value={theme.customCSS}
              onChange={(e) => setTheme({ ...theme, customCSS: e.target.value })}
              rows={12}
              placeholder="/* Add your custom CSS here */&#10;.my-class {&#10;  color: red;&#10;}"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
            <p className="text-xs text-gray-500 mt-2">
              Custom CSS will be injected into every storefront page. Use with caution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
