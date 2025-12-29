'use client';

import { useState } from 'react';
import { X, MapPin, Save } from 'lucide-react';
import type { Address, CreateAddressData } from '@/lib/api/addresses';

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (data: CreateAddressData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const bdDivisions = [
  'Barisal',
  'Chattogram',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
];

const addressLabels = ['Home', 'Work', 'Office', 'Other'];

export function AddressForm({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<CreateAddressData>({
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || '',
    district: address?.district || '',
    division: address?.division || '',
    postalCode: address?.postalCode || '',
    landmark: address?.landmark || '',
    label: address?.label || 'Home',
    isDefault: address?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const updateField = (field: keyof CreateAddressData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {address ? 'Edit Address' : 'Add New Address'}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Label Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Label
          </label>
          <div className="flex gap-2">
            {addressLabels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => updateField('label', label)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.label === label
                    ? 'bg-teal-100 text-teal-700 border border-teal-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Name and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="e.g. Rizwan Ahmed"
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Address Lines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => updateField('addressLine1', e.target.value)}
            placeholder="House/Flat No., Road, Area"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
            } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
          />
          {errors.addressLine1 && (
            <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => updateField('addressLine2', e.target.value)}
            placeholder="Apartment, Suite, Floor (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* City, District, Division */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="e.g. Dhaka"
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District *
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => updateField('district', e.target.value)}
              placeholder="e.g. Dhaka"
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.district ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
            />
            {errors.district && (
              <p className="text-xs text-red-500 mt-1">{errors.district}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division
            </label>
            <select
              value={formData.division}
              onChange={(e) => updateField('division', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Division</option>
              {bdDivisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Postal Code and Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
              placeholder="e.g. 1205"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => updateField('landmark', e.target.value)}
              placeholder="Near mosque, school, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Default Address */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => updateField('isDefault', e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">
            Set as default address
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isLoading
              ? 'Saving...'
              : address
                ? 'Update Address'
                : 'Save Address'}
          </button>
        </div>
      </form>
    </div>
  );
}
