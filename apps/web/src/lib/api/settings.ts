import { apiClient } from './client';

export type SettingsGroup =
  | 'general'
  | 'email'
  | 'shipping'
  | 'tax'
  | 'payment'
  | 'seo';

/** Fetch all settings across every group. */
export async function getAllSettings(): Promise<
  Record<SettingsGroup, Record<string, string>>
> {
  const { data } = await apiClient.get('/admin/settings');
  return data.data;
}

/** Fetch settings for a specific group. */
export async function getSettingsByGroup(
  group: SettingsGroup,
): Promise<Record<string, string>> {
  const { data } = await apiClient.get(`/admin/settings/${group}`);
  return data.data;
}

/** Update settings for a specific group. */
export async function updateSettings(
  group: SettingsGroup,
  values: Record<string, string>,
): Promise<Record<string, string>> {
  const { data } = await apiClient.put(`/admin/settings/${group}`, values);
  return data.data;
}

/** Delete a single setting key. */
export async function deleteSetting(
  group: SettingsGroup,
  key: string,
): Promise<void> {
  await apiClient.delete(`/admin/settings/${group}/${key}`);
}

/** Send a test email using current email settings. */
export async function sendTestEmail(toEmail: string): Promise<void> {
  await apiClient.post('/admin/settings/email/test', { to: toEmail });
}
