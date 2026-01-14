'use client';

import { useState } from 'react';
import {
  Plus,
  X,
  Layers,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

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

interface VariantsFormProps {
  options: OptionType[];
  variants: Variant[];
  onOptionsChange: (options: OptionType[]) => void;
  onVariantsChange: (variants: Variant[]) => void;
  basePrice?: number;
  baseSku?: string;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a variant matrix from option types.
 *
 * For example, given:
 *   Color: [Red, Blue]
 *   Size: [S, M, L]
 *
 * Produces 6 variants (Red-S, Red-M, Red-L, Blue-S, Blue-M, Blue-L).
 */
function generateVariantMatrix(
  options: OptionType[],
  basePrice: number,
  baseSku: string,
): Variant[] {
  if (options.length === 0 || options.every((o) => o.values.length === 0)) {
    return [];
  }

  const validOptions = options.filter((o) => o.values.length > 0);

  const combinations: Record<string, string>[] = validOptions.reduce<
    Record<string, string>[]
  >(
    (acc, option) => {
      if (acc.length === 0) {
        return option.values.map((value) => ({ [option.name]: value }));
      }
      const newCombinations: Record<string, string>[] = [];
      for (const existing of acc) {
        for (const value of option.values) {
          newCombinations.push({ ...existing, [option.name]: value });
        }
      }
      return newCombinations;
    },
    [],
  );

  return combinations.map((optionValues) => ({
    id: generateId(),
    options: optionValues,
    price: basePrice || null,
    stock: 0,
    sku: `${baseSku}-${Object.values(optionValues).join('-').toUpperCase().replace(/\s+/g, '')}`,
    isActive: true,
  }));
}

// ──────────────────────────────────────────────────────────
// Option Type Editor
// ──────────────────────────────────────────────────────────

interface OptionTypeEditorProps {
  option: OptionType;
  onChange: (option: OptionType) => void;
  onRemove: () => void;
  index: number;
}

function OptionTypeEditor({
  option,
  onChange,
  onRemove,
  index,
}: OptionTypeEditorProps) {
  const [newValue, setNewValue] = useState('');

  const addValue = () => {
    const trimmed = newValue.trim();
    if (trimmed && !option.values.includes(trimmed)) {
      onChange({ ...option, values: [...option.values, trimmed] });
      setNewValue('');
    }
  };

  const removeValue = (valueIndex: number) => {
    onChange({
      ...option,
      values: option.values.filter((_, i) => i !== valueIndex),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
          <span className="text-xs font-medium text-gray-500">
            Option {index + 1}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Option Name */}
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Option Name
        </label>
        <input
          type="text"
          value={option.name}
          onChange={(e) => onChange({ ...option, name: e.target.value })}
          placeholder="e.g., Color, Size, Weight"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Option Values */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Values
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {option.values.map((value, valueIndex) => (
            <span
              key={valueIndex}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700"
            >
              {value}
              <button
                onClick={() => removeValue(valueIndex)}
                className="rounded-full p-0.5 hover:bg-indigo-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a value and press Enter"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={addValue}
            disabled={!newValue.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Variants Form
// ──────────────────────────────────────────────────────────

/**
 * Product variants form for managing option types and variant matrix.
 *
 * Allows defining option types (e.g., Color, Size) with values,
 * then auto-generates a variant matrix with price/stock/SKU per variant.
 * All prices in BDT (৳).
 */
export function VariantsForm({
  options,
  variants,
  onOptionsChange,
  onVariantsChange,
  basePrice = 0,
  baseSku = '',
}: VariantsFormProps) {
  const [showVariants, setShowVariants] = useState(variants.length > 0);

  // ─── Option Handlers ──────────────────────────────────────────────

  const addOption = () => {
    onOptionsChange([
      ...options,
      { id: generateId(), name: '', values: [] },
    ]);
  };

  const updateOption = (index: number, option: OptionType) => {
    const updated = [...options];
    updated[index] = option;
    onOptionsChange(updated);
  };

  const removeOption = (index: number) => {
    onOptionsChange(options.filter((_, i) => i !== index));
  };

  // ─── Generate Variants ────────────────────────────────────────────

  const handleGenerateVariants = () => {
    const validOptions = options.filter(
      (o) => o.name.trim() && o.values.length > 0,
    );

    if (validOptions.length === 0) return;

    const generated = generateVariantMatrix(validOptions, basePrice, baseSku);
    onVariantsChange(generated);
    setShowVariants(true);
  };

  // ─── Update Variant ───────────────────────────────────────────────

  const updateVariant = (index: number, field: keyof Variant, value: unknown) => {
    const updated = [...variants];
    const existing = updated[index];
    if (!existing) return;
    updated[index] = { ...existing, [field]: value };
    onVariantsChange(updated);
  };

  const totalVariants = options.reduce(
    (acc, o) => acc * Math.max(o.values.length, 1),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Option Types */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Product Options
            </h2>
          </div>
          <button
            onClick={addOption}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </button>
        </div>

        {options.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <Layers className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              No options defined. Add options like Color, Size, or Weight to
              create product variants.
            </p>
            <button
              onClick={addOption}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add First Option
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {options.map((option, index) => (
              <OptionTypeEditor
                key={option.id}
                option={option}
                onChange={(updated) => updateOption(index, updated)}
                onRemove={() => removeOption(index)}
                index={index}
              />
            ))}

            {/* Generate Variants Button */}
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3">
              <p className="text-sm text-indigo-700">
                This will generate{' '}
                <span className="font-semibold">{totalVariants}</span> variant
                {totalVariants !== 1 ? 's' : ''}
              </p>
              <button
                onClick={handleGenerateVariants}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Generate Variants
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Variant Matrix Table */}
      {showVariants && variants.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Variants ({variants.length})
            </h3>
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showVariants ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {options
                    .filter((o) => o.name.trim())
                    .map((option) => (
                      <th
                        key={option.id}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        {option.name}
                      </th>
                    ))}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Price (৳)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((variant, index) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    {options
                      .filter((o) => o.name.trim())
                      .map((option) => (
                        <td
                          key={option.id}
                          className="whitespace-nowrap px-4 py-2 text-sm text-gray-700"
                        >
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                            {variant.options[option.name] ?? '—'}
                          </span>
                        </td>
                      ))}
                    <td className="px-4 py-2">
                      <div className="flex rounded border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                        <span className="inline-flex items-center border-r border-gray-300 bg-gray-50 px-2 text-xs text-gray-500">
                          ৳
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price ?? ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'price',
                              e.target.value ? parseFloat(e.target.value) : null,
                            )
                          }
                          className="w-24 rounded-r px-2 py-1.5 text-sm focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            'stock',
                            parseInt(e.target.value, 10) || 0,
                          )
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(index, 'sku', e.target.value)
                        }
                        className="w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(e) =>
                          updateVariant(index, 'isActive', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
