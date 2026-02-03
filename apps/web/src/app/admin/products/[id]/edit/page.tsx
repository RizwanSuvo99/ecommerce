'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Info,
  DollarSign,
  ImageIcon,
  Layers,
  Tag,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';

import { apiClient } from '@/lib/api/client';
import { PricingForm } from '@/components/admin/products/pricing-form';
import { MediaForm } from '@/components/admin/products/media-form';
import { VariantsForm } from '@/components/admin/products/variants-form';
import { CategorizationForm } from '@/components/admin/products/categorization-form';
import { SeoForm } from '@/components/admin/products/seo-form';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface ProductFormData {
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  descriptionBn: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  weight: number | null;
  categoryId: string;
  brandId: string;
  tags: string[];
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  options: OptionType[];
  variants: Variant[];
}

interface OptionType {
  id: string;
  name: string;
  values: string[];
}

interface Variant {
  id: string;
  options: Record<string, string>;
  price: number | null;
  stock: number;
  sku: string;
  isActive: boolean;
}

// ──────────────────────────────────────────────────────────
// Tabs
// ──────────────────────────────────────────────────────────

type TabId = 'basic' | 'pricing' | 'media' | 'variants' | 'categorization' | 'seo';

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'basic', label: 'Basic Info', icon: Info },
  { id: 'pricing', label: 'Pricing & Inventory', icon: DollarSign },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'variants', label: 'Variants', icon: Layers },
  { id: 'categorization', label: 'Categories & SEO', icon: Tag },
];

// ──────────────────────────────────────────────────────────
// Slug generator
// ──────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ──────────────────────────────────────────────────────────
// Product Edit Page
// ──────────────────────────────────────────────────────────

/**
 * Admin product edit page.
 *
 * Reuses all form components from the product creation flow but
 * pre-populates fields with existing product data. All prices in BDT (৳).
 */
export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    nameBn: '',
    slug: '',
    description: '',
    descriptionBn: '',
    sku: '',
    price: 0,
    compareAtPrice: null,
    costPrice: null,
    stock: 0,
    lowStockThreshold: 10,
    weight: null,
    categoryId: '',
    brandId: '',
    tags: [],
    images: [],
    isActive: false,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    options: [],
    variants: [],
  });

  // ─── Load Product Data ────────────────────────────────────────────

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get(`/admin/products/${productId}`);
        const product = data.data;

        setFormData({
          name: product.name ?? '',
          nameBn: product.nameBn ?? '',
          slug: product.slug ?? '',
          description: product.description ?? '',
          descriptionBn: product.descriptionBn ?? '',
          sku: product.sku ?? '',
          price: product.price ?? 0,
          compareAtPrice: product.compareAtPrice ?? null,
          costPrice: product.costPrice ?? null,
          stock: product.stock ?? 0,
          lowStockThreshold: product.lowStockThreshold ?? 10,
          weight: product.weight ?? null,
          categoryId: product.categoryId ?? '',
          brandId: product.brandId ?? '',
          tags: product.tags ?? [],
          images: product.images ?? [],
          isActive: product.isActive ?? false,
          isFeatured: product.isFeatured ?? false,
          metaTitle: product.metaTitle ?? '',
          metaDescription: product.metaDescription ?? '',
          options: product.options ?? [],
          variants: product.variants ?? [],
        });
      } catch (err) {
        console.error('Failed to load product:', err);
        setErrors({ _form: 'Failed to load product data.' });
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // ─── Form Update Handler ──────────────────────────────────────────

  const updateField = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && typeof value === 'string') {
        next.slug = generateSlug(value);
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ─── Save Handler ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Product name is required' });
      setActiveTab('basic');
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.patch(`/admin/products/${productId}`, formData);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete Handler ───────────────────────────────────────────────

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiClient.delete(`/admin/products/${productId}`);
      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Product
            </h1>
            <p className="text-sm text-gray-500">
              {formData.name || 'Untitled Product'}
              {lastSaved && (
                <span className="ml-2 text-green-600">
                  · Last saved{' '}
                  {lastSaved.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/products/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            Preview
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Status Toggle */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <label className="flex items-center gap-3">
          <div
            className={cn(
              'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors',
              formData.isActive ? 'bg-green-500' : 'bg-gray-300',
            )}
            onClick={() => updateField('isActive', !formData.isActive)}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                formData.isActive ? 'translate-x-5' : 'translate-x-0.5',
              )}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {formData.isActive ? 'Published' : 'Draft'}
          </span>
        </label>
        <span className="text-xs text-gray-500">
          {formData.isActive
            ? 'This product is visible on the store.'
            : 'This product is hidden from customers.'}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Basic Information
          </h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="edit-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={cn(
                  'w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1',
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                )}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="edit-nameBn" className="mb-1.5 block text-sm font-medium text-gray-700">
                Product Name (বাংলা)
              </label>
              <input
                id="edit-nameBn"
                type="text"
                value={formData.nameBn}
                onChange={(e) => updateField('nameBn', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="edit-slug" className="mb-1.5 block text-sm font-medium text-gray-700">
                URL Slug
              </label>
              <div className="flex rounded-lg border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <span className="inline-flex items-center border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                  /products/
                </span>
                <input
                  id="edit-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="flex-1 rounded-r-lg px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="edit-description"
                rows={5}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="edit-descriptionBn" className="mb-1.5 block text-sm font-medium text-gray-700">
                Description (বাংলা)
              </label>
              <textarea
                id="edit-descriptionBn"
                rows={4}
                value={formData.descriptionBn}
                onChange={(e) => updateField('descriptionBn', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:max-w-xs">
              <label htmlFor="edit-sku" className="mb-1.5 block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                id="edit-sku"
                type="text"
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <PricingForm
          data={{
            price: formData.price,
            compareAtPrice: formData.compareAtPrice,
            costPrice: formData.costPrice,
            stock: formData.stock,
            lowStockThreshold: formData.lowStockThreshold,
            weight: formData.weight,
          }}
          onChange={(field, value) => updateField(field as keyof ProductFormData, value as never)}
          errors={errors}
        />
      )}

      {activeTab === 'media' && (
        <MediaForm
          images={formData.images}
          onChange={(images) => updateField('images', images)}
        />
      )}

      {activeTab === 'variants' && (
        <VariantsForm
          options={formData.options}
          variants={formData.variants}
          onOptionsChange={(options) => updateField('options', options)}
          onVariantsChange={(variants) => updateField('variants', variants)}
          basePrice={formData.price}
          baseSku={formData.sku}
        />
      )}

      {activeTab === 'categorization' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategorizationForm
            categoryId={formData.categoryId}
            brandId={formData.brandId}
            tags={formData.tags}
            isFeatured={formData.isFeatured}
            onCategoryChange={(id) => updateField('categoryId', id)}
            onBrandChange={(id) => updateField('brandId', id)}
            onTagsChange={(tags) => updateField('tags', tags)}
            onFeaturedChange={(featured) => updateField('isFeatured', featured)}
          />
          <SeoForm
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            slug={formData.slug}
            productName={formData.name}
            onMetaTitleChange={(val) => updateField('metaTitle', val)}
            onMetaDescriptionChange={(val) => updateField('metaDescription', val)}
          />
        </div>
      )}
    </div>
  );
}
