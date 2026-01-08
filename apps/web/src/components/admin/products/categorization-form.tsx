'use client';

import { useEffect, useState } from 'react';
import {
  FolderTree,
  Tag,
  Building2,
  Search,
  Check,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';

import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  _count?: { products: number };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface CategorizationFormProps {
  categoryId: string;
  brandId: string;
  tags: string[];
  isFeatured: boolean;
  onCategoryChange: (id: string) => void;
  onBrandChange: (id: string) => void;
  onTagsChange: (tags: string[]) => void;
  onFeaturedChange: (featured: boolean) => void;
}

// ──────────────────────────────────────────────────────────
// Category Tree Item
// ──────────────────────────────────────────────────────────

interface CategoryTreeItemProps {
  category: Category;
  selectedId: string;
  onSelect: (id: string) => void;
  level: number;
}

function CategoryTreeItem({
  category,
  selectedId,
  onSelect,
  level,
}: CategoryTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category.id === selectedId;

  return (
    <div>
      <button
        onClick={() => onSelect(category.id)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
          isSelected
            ? 'bg-teal-50 text-teal-700'
            : 'text-gray-700 hover:bg-gray-50',
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex-shrink-0"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                expanded && 'rotate-90',
              )}
            />
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="flex-1 text-left">{category.name}</span>
        {isSelected && <Check className="h-4 w-4 text-teal-600" />}
        {category._count && (
          <span className="text-xs text-gray-400">
            {category._count.products}
          </span>
        )}
      </button>
      {expanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Categorization Form
// ──────────────────────────────────────────────────────────

/**
 * Product categorization form with category tree selection,
 * brand selection, and tags management.
 */
export function CategorizationForm({
  categoryId,
  brandId,
  tags,
  isFeatured,
  onCategoryChange,
  onBrandChange,
  onTagsChange,
  onFeaturedChange,
}: CategorizationFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

  // ─── Load Categories ──────────────────────────────────────────────

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await apiClient.get('/categories');
        setCategories(data.data ?? data ?? []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        toast.error('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // ─── Load Brands ──────────────────────────────────────────────────

  useEffect(() => {
    async function loadBrands() {
      try {
        const { data } = await apiClient.get('/brands');
        setBrands(data.data ?? data ?? []);
      } catch (err) {
        console.error('Failed to load brands:', err);
        toast.error('Failed to load brands');
      } finally {
        setIsLoadingBrands(false);
      }
    }
    loadBrands();
  }, []);

  // ─── Tag Handlers ─────────────────────────────────────────────────

  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  // ─── Filter ───────────────────────────────────────────────────────

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Category</h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Category Tree */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
          {isLoadingCategories ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No categories found.
            </div>
          ) : (
            categories.map((category) => (
              <CategoryTreeItem
                key={category.id}
                category={category}
                selectedId={categoryId}
                onSelect={onCategoryChange}
                level={0}
              />
            ))
          )}
        </div>
      </div>

      {/* Brand Selection */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Brand</h2>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
          {isLoadingBrands ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading brands...
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => onBrandChange(brand.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors',
                  brand.id === brandId
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-6 w-6 rounded object-contain"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-xs font-medium text-gray-500">
                    {brand.name.charAt(0)}
                  </div>
                )}
                <span className="flex-1 text-left">{brand.name}</span>
                {brand.id === brandId && (
                  <Check className="h-4 w-4 text-teal-600" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <button
            onClick={addTag}
            disabled={!newTag.trim()}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Featured Product
            </p>
            <p className="text-xs text-gray-500">
              Display this product in the featured section on the homepage
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
