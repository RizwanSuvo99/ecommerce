'use client';

import * as React from 'react';
import { ImagePlus, X } from 'lucide-react';

import { cn } from '../lib/utils';

export interface ImageUploadProps {
  /** Array of current image URLs / object URLs. */
  value: string[];
  /** Called when images are added or removed. */
  onChange: (urls: string[]) => void;
  /** Maximum number of images allowed. Defaults to `5`. */
  maxImages?: number;
  /** Maximum file size in bytes. Defaults to 5 MB. */
  maxSizeBytes?: number;
  /** Accepted MIME types. Defaults to common image types. */
  accept?: string;
  /** Whether the uploader is disabled. */
  disabled?: boolean;
  /** Additional class names for the root container. */
  className?: string;
}

/**
 * ImageUpload — a drag-and-drop image upload zone with previews.
 *
 * Renders a clickable drop zone that accepts image files. Selected
 * images are displayed as thumbnails with a remove button. Supports
 * multiple file selection.
 *
 * @example
 * ```tsx
 * const [images, setImages] = React.useState<string[]>([]);
 *
 * <ImageUpload
 *   value={images}
 *   onChange={setImages}
 *   maxImages={4}
 * />
 * ```
 */
function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  maxSizeBytes = 5 * 1024 * 1024,
  accept = 'image/png,image/jpeg,image/webp,image/gif',
  disabled = false,
  className,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const canAddMore = value.length < maxImages;

  const processFiles = React.useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const remainingSlots = maxImages - value.length;

      const validFiles = fileArray
        .filter((file) => {
          if (!acceptedTypes.some((type) => file.type.match(type.replace('*', '.*')))) {
            return false;
          }
          if (file.size > maxSizeBytes) {
            return false;
          }
          return true;
        })
        .slice(0, remainingSlots);

      if (validFiles.length === 0) return;

      const newUrls = validFiles.map((file) => URL.createObjectURL(file));
      onChange([...value, ...newUrls]);
    },
    [accept, maxImages, maxSizeBytes, onChange, value]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && canAddMore) {
        setIsDragOver(true);
      }
    },
    [disabled, canAddMore]
  );

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || !canAddMore) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, canAddMore, processFiles]
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
      // Reset the input so selecting the same file again triggers onChange
      e.target.value = '';
    },
    [processFiles]
  );

  const handleRemove = React.useCallback(
    (index: number) => {
      const url = value[index];
      // Revoke object URL to free memory
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      onChange(value.filter((_, i) => i !== index));
    },
    [onChange, value]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Previews */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="group relative h-24 w-24 overflow-hidden rounded-md border"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={disabled}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <span className="font-medium text-foreground">
              Click to upload
            </span>{' '}
            <span className="text-muted-foreground">or drag and drop</span>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WebP or GIF (max {Math.round(maxSizeBytes / 1024 / 1024)}MB)
          </p>
          {maxImages > 1 && (
            <p className="text-xs text-muted-foreground">
              {value.length} / {maxImages} images
            </p>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxImages > 1}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
ImageUpload.displayName = 'ImageUpload';

export { ImageUpload };
