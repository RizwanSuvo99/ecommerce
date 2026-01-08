import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import {
  StorageAdapter,
  UploadResult,
  UploadOptions,
} from '../interfaces/storage-adapter.interface';

/**
 * Local filesystem storage adapter.
 * Saves uploaded files to a local directory, suitable for development
 * and single-server deployments.
 *
 * Files are organized by directory prefix and given unique names
 * to prevent collisions.
 */
@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>(
      'UPLOAD_DIR',
      path.join(process.cwd(), 'uploads'),
    );
    this.baseUrl = this.configService.get<string>(
      'UPLOAD_BASE_URL',
      'http://localhost:3000/uploads',
    );

    // Ensure the upload directory exists
    this.ensureDirectoryExists(this.uploadDir);
    this.logger.log(`Local storage initialized at: ${this.uploadDir}`);
  }

  /**
   * Upload a file to the local filesystem.
   */
  async upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const ext = path.extname(originalName) || this.getExtensionFromMime(mimeType);
    const filename = options?.filename
      ? `${options.filename}${ext}`
      : `${uuidv4()}${ext}`;

    // Build the storage path
    const directory = options?.directory || 'general';
    const datePrefix = this.getDatePrefix();
    const relativePath = path.join(directory, datePrefix, filename);
    const absolutePath = path.join(this.uploadDir, relativePath);

    // Ensure target directory exists
    this.ensureDirectoryExists(path.dirname(absolutePath));

    // Write the file
    await fs.promises.writeFile(absolutePath, file);

    const key = relativePath.replace(/\\/g, '/'); // Normalize path separators

    this.logger.debug(`Uploaded file to local storage: ${key} (${file.length} bytes)`);

    return {
      key,
      url: this.getUrl(key),
      originalName,
      mimeType,
      size: file.length,
      storage: 'local',
    };
  }

  /**
   * Delete a file from local storage.
   */
  async delete(key: string): Promise<boolean> {
    const absolutePath = path.join(this.uploadDir, key);

    try {
      await fs.promises.access(absolutePath, fs.constants.F_OK);
      await fs.promises.unlink(absolutePath);
      this.logger.debug(`Deleted file from local storage: ${key}`);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.warn(`File not found for deletion: ${key}`);
        return false;
      }
      throw error;
    }
  }

  /**
   * Get the public URL for a locally stored file.
   */
  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Ensure a directory exists, creating it recursively if needed.
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Generate a date-based prefix for file organization (YYYY/MM).
   */
  private getDatePrefix(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }

  /**
   * Get file extension from MIME type.
   */
  private getExtensionFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'application/json': '.json',
      'text/plain': '.txt',
      'text/csv': '.csv',
    };

    return mimeToExt[mimeType] || '.bin';
  }
}
