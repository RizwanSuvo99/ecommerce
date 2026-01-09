import { Injectable, Logger } from '@nestjs/common';

/**
 * Supported image resize presets.
 */
export interface ImageVariant {
  /** Variant name used as suffix/key */
  name: string;
  /** Target width in pixels */
  width: number;
  /** Target height in pixels (optional, maintains aspect ratio if omitted) */
  height?: number;
  /** Image quality (1-100) */
  quality: number;
}

/**
 * Result of processing a single image variant.
 */
export interface ProcessedImage {
  /** Variant name */
  name: string;
  /** Processed image buffer */
  buffer: Buffer;
  /** Width of the processed image */
  width: number;
  /** Height of the processed image */
  height: number;
  /** Output format */
  format: string;
  /** File size in bytes */
  size: number;
}

/**
 * Complete result of image processing including all variants
 * and optional blur hash placeholder.
 */
export interface ImageProcessingResult {
  /** All generated image variants */
  variants: ProcessedImage[];
  /** Base64 blur hash placeholder for progressive loading */
  blurDataUrl: string | null;
  /** Original image metadata */
  originalWidth: number;
  originalHeight: number;
}

/**
 * Default image variants for the e-commerce platform.
 */
const DEFAULT_VARIANTS: ImageVariant[] = [
  { name: 'thumb', width: 150, quality: 80 },
  { name: 'medium', width: 600, quality: 85 },
  { name: 'large', width: 1200, quality: 90 },
];

/**
 * Image processing service powered by sharp.
 *
 * Handles resizing, format conversion (to WebP), and
 * blur hash placeholder generation for progressive image loading.
 */
@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Process an image buffer into multiple variants.
   *
   * Each variant is resized, converted to WebP format, and optimized.
   * A tiny blur hash placeholder is also generated for progressive loading.
   *
   * @param buffer - The original image buffer
   * @param variants - Resize presets (defaults to thumb/medium/large)
   * @returns Processing result with all variants and blur placeholder
   */
  async processImage(
    buffer: Buffer,
    variants: ImageVariant[] = DEFAULT_VARIANTS,
  ): Promise<ImageProcessingResult> {
    // Dynamic import of sharp to handle environments where it may not be available
    const sharp = (await import('sharp')).default;

    const image = sharp(buffer);
    const metadata = await image.metadata();

    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    this.logger.debug(
      `Processing image: ${originalWidth}x${originalHeight}, format: ${metadata.format}`,
    );

    // Process all variants in parallel
    const processedVariants = await Promise.all(
      variants.map(async (variant) => {
        return this.createVariant(buffer, variant);
      }),
    );

    // Generate blur hash placeholder
    const blurDataUrl = await this.generateBlurPlaceholder(buffer);

    this.logger.debug(
      `Image processing complete: ${processedVariants.length} variants generated`,
    );

    return {
      variants: processedVariants,
      blurDataUrl,
      originalWidth,
      originalHeight,
    };
  }

  /**
   * Create a single resized variant of the image.
   *
   * @param buffer - Original image buffer
   * @param variant - Resize specification
   * @returns Processed image data
   */
  private async createVariant(
    buffer: Buffer,
    variant: ImageVariant,
  ): Promise<ProcessedImage> {
    const sharp = (await import('sharp')).default;

    const resized = sharp(buffer)
      .resize(variant.width, variant.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: variant.quality });

    const processedBuffer = await resized.toBuffer();
    const info = await sharp(processedBuffer).metadata();

    this.logger.debug(
      `Created variant "${variant.name}": ${info.width}x${info.height}, ${this.formatBytes(processedBuffer.length)}`,
    );

    return {
      name: variant.name,
      buffer: processedBuffer,
      width: info.width || variant.width,
      height: info.height || 0,
      format: 'webp',
      size: processedBuffer.length,
    };
  }

  /**
   * Generate a tiny blurred placeholder image encoded as a base64 data URL.
   *
   * This placeholder is embedded inline in HTML/CSS to show an
   * instant blurred preview while the full image loads progressively.
   *
   * @param buffer - Original image buffer
   * @returns Base64 data URL of the blur placeholder, or null on error
   */
  private async generateBlurPlaceholder(buffer: Buffer): Promise<string | null> {
    try {
      const sharp = (await import('sharp')).default;

      const placeholderBuffer = await sharp(buffer)
        .resize(20, 20, { fit: 'inside' })
        .blur(10)
        .webp({ quality: 20 })
        .toBuffer();

      const base64 = placeholderBuffer.toString('base64');
      return `data:image/webp;base64,${base64}`;
    } catch (error) {
      this.logger.warn('Failed to generate blur placeholder', error);
      return null;
    }
  }

  /**
   * Format bytes to a human-readable string.
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
