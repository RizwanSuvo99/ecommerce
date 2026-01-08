import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';

import {
  StorageAdapter,
  UploadResult,
  UploadOptions,
  STORAGE_ADAPTER,
} from './interfaces/storage-adapter.interface';

/**
 * Allowed MIME types for file uploads.
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

/**
 * Maximum file sizes (in bytes).
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50 MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(STORAGE_ADAPTER)
    private readonly storageAdapter: StorageAdapter,
  ) {}

  /**
   * Upload a single file with validation.
   *
   * @param file - File buffer
   * @param originalName - Original filename
   * @param mimeType - MIME type of the file
   * @param options - Upload options (directory, public access, etc.)
   * @returns Upload result with URL and metadata
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    // Validate MIME type
    if (!ALL_ALLOWED_TYPES.includes(mimeType)) {
      throw new BadRequestException(
        `File type "${mimeType}" is not allowed. Allowed types: ${ALL_ALLOWED_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    const maxSize = ALLOWED_IMAGE_TYPES.includes(mimeType)
      ? MAX_IMAGE_SIZE
      : MAX_DOCUMENT_SIZE;

    if (file.length > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${maxMB} MB`,
      );
    }

    // Sanitize original filename
    const sanitizedName = this.sanitizeFilename(originalName);

    this.logger.log(`Uploading file: ${sanitizedName} (${mimeType}, ${this.formatFileSize(file.length)})`);

    const result = await this.storageAdapter.upload(file, sanitizedName, mimeType, options);

    this.logger.log(`File uploaded successfully: ${result.key}`);

    return result;
  }

  /**
   * Upload an image with validation specific to image files.
   */
  async uploadImage(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw new BadRequestException(
        `Invalid image type "${mimeType}". Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    return this.uploadFile(file, originalName, mimeType, {
      ...options,
      directory: options?.directory || 'images',
    });
  }

  /**
   * Delete a file from storage.
   */
  async deleteFile(key: string): Promise<boolean> {
    this.logger.log(`Deleting file: ${key}`);
    const result = await this.storageAdapter.delete(key);

    if (!result) {
      this.logger.warn(`File not found for deletion: ${key}`);
    }

    return result;
  }

  /**
   * Delete multiple files from storage.
   */
  async deleteFiles(keys: string[]): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const key of keys) {
      try {
        const result = await this.storageAdapter.delete(key);
        if (result) {
          deleted++;
        } else {
          failed++;
        }
      } catch (error) {
        this.logger.error(`Failed to delete file: ${key}`, error);
        failed++;
      }
    }

    this.logger.log(`Bulk delete: ${deleted} deleted, ${failed} failed out of ${keys.length} files`);

    return { deleted, failed };
  }

  /**
   * Get the URL for a stored file.
   */
  getFileUrl(key: string): string {
    return this.storageAdapter.getUrl(key);
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Sanitize a filename to remove potentially dangerous characters.
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * Format file size for human-readable logging.
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
