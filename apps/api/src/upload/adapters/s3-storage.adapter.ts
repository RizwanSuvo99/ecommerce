import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

import {
  StorageAdapter,
  UploadResult,
  UploadOptions,
} from '../interfaces/storage-adapter.interface';

/**
 * Amazon S3 storage adapter.
 *
 * Uploads files to an S3-compatible bucket. Supports presigned URLs
 * for private objects and direct CDN URLs for public buckets.
 *
 * Environment variables:
 *   - AWS_REGION: AWS region (default: ap-southeast-1)
 *   - AWS_ACCESS_KEY_ID: IAM access key
 *   - AWS_SECRET_ACCESS_KEY: IAM secret key
 *   - S3_BUCKET: Target bucket name
 *   - S3_ENDPOINT: Custom endpoint for S3-compatible services (optional)
 *   - S3_CDN_URL: CDN URL prefix for public files (optional)
 *   - S3_PRESIGNED_EXPIRY: Presigned URL expiry in seconds (default: 3600)
 *   - STORAGE_TYPE: Set to "s3" to activate this adapter
 */
@Injectable()
export class S3StorageAdapter implements StorageAdapter {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnUrl: string | null;
  private readonly presignedExpiry: number;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'ap-southeast-1');
    this.bucket = this.configService.get<string>('S3_BUCKET', 'ecommerce-uploads');
    this.cdnUrl = this.configService.get<string>('S3_CDN_URL', null);
    this.presignedExpiry = this.configService.get<number>('S3_PRESIGNED_EXPIRY', 3600);

    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    this.s3Client = new S3Client({
      region: this.region,
      ...(endpoint && {
        endpoint,
        forcePathStyle: true, // Required for MinIO and other S3-compatible services
      }),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });

    this.logger.log(`S3 storage initialized: bucket="${this.bucket}", region="${this.region}"`);
  }

  /**
   * Upload a file to S3.
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

    // Build the S3 key
    const directory = options?.directory || 'general';
    const datePrefix = this.getDatePrefix();
    const key = `${directory}/${datePrefix}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ...(options?.isPublic && { ACL: 'public-read' }),
      ...(options?.metadata && { Metadata: options.metadata }),
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await this.s3Client.send(command);

    this.logger.debug(`Uploaded file to S3: ${key} (${file.length} bytes)`);

    return {
      key,
      url: this.getUrl(key),
      originalName,
      mimeType,
      size: file.length,
      storage: 's3',
    };
  }

  /**
   * Delete a file from S3.
   */
  async delete(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.debug(`Deleted file from S3: ${key}`);
      return true;
    } catch (error) {
      this.logger.warn(`Failed to delete file from S3: ${key}`, error);
      return false;
    }
  }

  /**
   * Get the URL for an S3 object.
   *
   * If a CDN URL is configured, it returns the CDN path directly.
   * Otherwise, it returns the standard S3 URL.
   */
  getUrl(key: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Generate a presigned URL for temporary access to a private object.
   *
   * @param key - The S3 object key
   * @param expiresIn - Expiry time in seconds (defaults to configured value)
   * @returns Presigned URL string
   */
  async getPresignedUrl(key: string, expiresIn?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresIn || this.presignedExpiry,
    });

    this.logger.debug(`Generated presigned URL for: ${key}`);

    return url;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Generate a date-based prefix for key organization (YYYY/MM).
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
