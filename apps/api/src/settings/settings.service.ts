import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export type SettingsGroup =
  | 'general'
  | 'email'
  | 'shipping'
  | 'tax'
  | 'payment'
  | 'seo';

interface SettingRecord {
  id: string;
  group: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Retrieve all settings for a given group. */
  async getByGroup(group: SettingsGroup): Promise<Record<string, string>> {
    const rows: SettingRecord[] = await this.prisma.$queryRaw`
      SELECT * FROM settings WHERE "group" = ${group} ORDER BY key
    `;

    return rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  }

  /** Retrieve a single setting value. */
  async get(group: SettingsGroup, key: string): Promise<string> {
    const rows: SettingRecord[] = await this.prisma.$queryRaw`
      SELECT * FROM settings WHERE "group" = ${group} AND key = ${key} LIMIT 1
    `;

    if (rows.length === 0) {
      throw new NotFoundException(`Setting ${group}.${key} not found`);
    }

    return rows[0].value;
  }

  /** Upsert multiple settings in a single group. */
  async updateGroup(
    group: SettingsGroup,
    data: Record<string, string>,
  ): Promise<Record<string, string>> {
    const entries = Object.entries(data);

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.$executeRaw`
          INSERT INTO settings ("id", "group", "key", "value", "updatedAt")
          VALUES (gen_random_uuid(), ${group}, ${key}, ${value}, NOW())
          ON CONFLICT ("group", "key")
          DO UPDATE SET "value" = ${value}, "updatedAt" = NOW()
        `,
      ),
    );

    return this.getByGroup(group);
  }

  /** Delete a single setting. */
  async delete(group: SettingsGroup, key: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM settings WHERE "group" = ${group} AND key = ${key}
    `;
  }

  /** Get all settings across all groups. */
  async getAll(): Promise<Record<SettingsGroup, Record<string, string>>> {
    const rows: SettingRecord[] = await this.prisma.$queryRaw`
      SELECT * FROM settings ORDER BY "group", key
    `;

    const result = {} as Record<SettingsGroup, Record<string, string>>;

    for (const row of rows) {
      const grp = row.group as SettingsGroup;
      if (!result[grp]) result[grp] = {};
      result[grp][row.key] = row.value;
    }

    return result;
  }
}
