'use client';

import { useState } from 'react';

// ──────────────────────────────────────────────────────────
// Bangladesh Divisions and Districts
// ──────────────────────────────────────────────────────────

/**
 * All 8 divisions of Bangladesh with their major districts.
 */
const BD_DIVISIONS: Record<string, string[]> = {
  Barishal: ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  Chattogram: [
    'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla',
    'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati',
  ],
  Dhaka: [
    'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj',
    'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi',
    'Rajbari', 'Shariatpur', 'Tangail',
  ],
  Khulna: [
    'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna',
    'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira',
  ],
  Mymensingh: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
  Rajshahi: [
    'Bogura', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore',
    'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj',
  ],
  Rangpur: [
    'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari',
    'Panchagarh', 'Rangpur', 'Thakurgaon',
  ],
  Sylhet: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
};

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  division: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressStepProps {
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onContinue: () => void;
}

// ──────────────────────────────────────────────────────────
// New Address Form
// ──────────────────────────────────────────────────────────

interface NewAddressFormProps {
  onSave: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  onCancel: () => void;
}

function NewAddressForm({ onSave, onCancel }: NewAddressFormProps) {
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
  });

  const districts = division ? BD_DIVISIONS[division] || [] : [];

  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    setDistrict('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      division,
      district,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 p-6 bg-gray-50 rounded-xl">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Add New Address
      </h3>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="First name"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Last name"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="+880 1XXX-XXXXXX"
        />
      </div>

      {/* Address line 1 */}
      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          id="addressLine1"
          type="text"
          required
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="House no., road, area"
        />
      </div>

      {/* Address line 2 */}
      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
          Apartment, Suite, etc. <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="addressLine2"
          type="text"
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="Apartment, suite, floor"
        />
      </div>

      {/* Division and District */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">
            Division
          </label>
          <select
            id="division"
            required
            value={division}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Select Division</option>
            {Object.keys(BD_DIVISIONS).map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <select
            id="district"
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!division}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select District</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City and Postal Code */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City / Town
          </label>
          <input
            id="city"
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="City"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            id="postalCode"
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="1000"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Save Address
        </button>
      </div>
    </form>
  );
}

// ──────────────────────────────────────────────────────────
// Address Card
// ──────────────────────────────────────────────────────────

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}

function AddressCard({ address, isSelected, onSelect }: AddressCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">
            {address.firstName} {address.lastName}
          </p>
          <p className="mt-1 text-sm text-gray-600">{address.phone}</p>
          <p className="mt-1 text-sm text-gray-500">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-sm text-gray-500">
            {address.city}, {address.district}, {address.division} {address.postalCode}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {address.isDefault && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Default
            </span>
          )}

          <div
            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-blue-600' : 'border-gray-300'
            }`}
          >
            {isSelected && (
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ──────────────────────────────────────────────────────────
// Address Step Component
// ──────────────────────────────────────────────────────────

/**
 * Checkout Step 1: Shipping Address
 *
 * Allows the user to select an existing saved address or create
 * a new one. Supports all 8 divisions and 64 districts of Bangladesh.
 */
export default function AddressStep({
  selectedAddressId,
  onSelectAddress,
  onContinue,
}: AddressStepProps) {
  const [showNewForm, setShowNewForm] = useState(false);

  // TODO: Fetch saved addresses from the API
  const savedAddresses: Address[] = [];

  const handleSaveNewAddress = (addressData: Omit<Address, 'id' | 'isDefault'>) => {
    // TODO: POST to API and get the created address back
    console.log('Saving new address:', addressData);
    setShowNewForm(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Shipping Address
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Select a delivery address or add a new one
      </p>

      {/* Saved addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3 mb-6">
          {savedAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddressId === address.id}
              onSelect={() => onSelectAddress(address.id)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {savedAddresses.length === 0 && !showNewForm && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center mb-6">
          <p className="text-gray-500 mb-4">
            No saved addresses found. Add a new address to continue.
          </p>
        </div>
      )}

      {/* Add new address button */}
      {!showNewForm && (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Address
        </button>
      )}

      {/* New address form */}
      {showNewForm && (
        <NewAddressForm
          onSave={handleSaveNewAddress}
          onCancel={() => setShowNewForm(false)}
        />
      )}

      {/* Continue button */}
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedAddressId}
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );
}
