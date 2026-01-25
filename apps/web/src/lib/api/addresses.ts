import { apiClient } from './client';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  division?: string;
  postalCode?: string;
  landmark?: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  division?: string;
  postalCode?: string;
  landmark?: string;
  label?: string;
  isDefault?: boolean;
}

export type UpdateAddressData = Partial<CreateAddressData>;

// ──────────────────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────────────────

export async function getAddresses(): Promise<Address[]> {
  const response = await apiClient.get<{ success: boolean; data: Address[] }>(
    '/users/addresses',
  );
  return response.data.data;
}

export async function getAddressById(id: string): Promise<Address> {
  const response = await apiClient.get<{ success: boolean; data: Address }>(
    `/users/addresses/${id}`,
  );
  return response.data.data;
}

export async function createAddress(data: CreateAddressData): Promise<Address> {
  const response = await apiClient.post<{ success: boolean; data: Address }>(
    '/users/addresses',
    data,
  );
  return response.data.data;
}

export async function updateAddress(
  id: string,
  data: UpdateAddressData,
): Promise<Address> {
  const response = await apiClient.put<{ success: boolean; data: Address }>(
    `/users/addresses/${id}`,
    data,
  );
  return response.data.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/users/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const response = await apiClient.patch<{ success: boolean; data: Address }>(
    `/users/addresses/${id}/default`,
  );
  return response.data.data;
}
