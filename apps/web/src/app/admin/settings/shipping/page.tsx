'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface ShippingZone {
  name: string;
  divisions: string[];
  flatRate: number;
  freeAbove?: number;
  estimatedDays?: number;
}

interface ShippingMethod {
  id: string;
  name: string;
  enabled: boolean;
  baseCost: number;
}

interface ShippingSettings {
  methods: ShippingMethod[];
  zones: ShippingZone[];
  enableFreeShipping: boolean;
  freeShippingThreshold: number;
}

const BD_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna',
  'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const DEFAULT_METHODS: ShippingMethod[] = [
  { id: 'standard', name: 'Standard Delivery', enabled: true, baseCost: 60 },
  { id: 'express', name: 'Express Delivery', enabled: true, baseCost: 120 },
  { id: 'same-day', name: 'Same Day (Dhaka Only)', enabled: false, baseCost: 200 },
];

const DEFAULT_ZONES: ShippingZone[] = [
  { name: 'Inside Dhaka', divisions: ['Dhaka'], flatRate: 60, freeAbove: 2000, estimatedDays: 2 },
  { name: 'Outside Dhaka', divisions: BD_DIVISIONS.filter((d) => d !== 'Dhaka'), flatRate: 120, freeAbove: 3000, estimatedDays: 5 },
];

export default function ShippingSettingsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>(DEFAULT_METHODS);
  const [zones, setZones] = useState<ShippingZone[]>(DEFAULT_ZONES);
  const [enableFreeShipping, setEnableFreeShipping] = useState(false);
  const [freeThreshold, setFreeThreshold] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettingsByGroup('shipping')
      .then((data) => {
        if (data.methods) setMethods(JSON.parse(data.methods));
        if (data.zones) setZones(JSON.parse(data.zones));
        if (data.enableFreeShipping) setEnableFreeShipping(data.enableFreeShipping === 'true');
        if (data.freeShippingThreshold) setFreeThreshold(Number(data.freeShippingThreshold));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleMethod = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    );
  };

  const updateMethodCost = (id: string, cost: number) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, baseCost: cost } : m)),
    );
  };

  const updateZoneRate = (index: number, rate: number) => {
    setZones((prev) =>
      prev.map((z, i) => (i === index ? { ...z, flatRate: rate } : z)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('shipping', {
        methods: JSON.stringify(methods),
        zones: JSON.stringify(zones),
        enableFreeShipping: String(enableFreeShipping),
        freeShippingThreshold: String(freeThreshold),
      });
      toast.success('Shipping settings saved');
    } catch {
      toast.error('Failed to save shipping settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading shipping settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-900">Shipping Settings</h2>

      {/* Shipping Methods */}
      <section className="space-y-4">
        <h3 className="font-medium text-gray-800">Shipping Methods</h3>
        <div className="space-y-3">
          {methods.map((method) => (
            <div key={method.id} className="flex items-center gap-4 rounded-md border p-3">
              <input
                type="checkbox"
                checked={method.enabled}
                onChange={() => toggleMethod(method.id)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="flex-1 text-sm font-medium">{method.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">৳</span>
                <input
                  type="number"
                  value={method.baseCost}
                  onChange={(e) => updateMethodCost(method.id, Number(e.target.value))}
                  className="w-24 rounded-md border-gray-300 text-sm shadow-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping Zones */}
      <section className="space-y-4">
        <h3 className="font-medium text-gray-800">Shipping Zones</h3>
        <div className="space-y-4">
          {zones.map((zone, idx) => (
            <div key={zone.name} className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">{zone.name}</h4>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Flat Rate: ৳</span>
                  <input
                    type="number"
                    value={zone.flatRate}
                    onChange={(e) => updateZoneRate(idx, Number(e.target.value))}
                    className="w-24 rounded-md border-gray-300 text-sm shadow-sm"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Divisions: {zone.divisions.join(', ')}
              </p>
              {zone.estimatedDays && (
                <p className="text-xs text-gray-500">
                  Estimated delivery: {zone.estimatedDays} days
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Free Shipping */}
      <section className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enableFreeShipping}
            onChange={(e) => setEnableFreeShipping(e.target.checked)}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Enable free shipping above threshold
          </span>
        </label>
        {enableFreeShipping && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Threshold: ৳</span>
            <input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(Number(e.target.value))}
              className="w-32 rounded-md border-gray-300 text-sm shadow-sm"
            />
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Shipping Settings'}
        </button>
      </div>
    </form>
  );
}
