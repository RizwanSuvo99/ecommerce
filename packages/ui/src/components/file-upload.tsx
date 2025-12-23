'use client';

import * as React from 'react';
import { File, UploadCloud, X } from 'lucide-react';

import { cn } from '../lib/utils';
import { Progress } from './progress';

export interface UploadedFile {
  /** Unique identifier for the file. */
  id: string;
  /** Original file name. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** MIME type. */
  type: string;
  /** Upload progress (0-100). `undefined` means not started. */
  progress?: number;
  /** Error message if upload failed. */
  error?: string;
}

export interface FileUploadProps {
  /** Current list of uploaded / uploading files. */
  value: UploadedFile[];
  /** Called when files are added or removed. */
  onChange: (files: UploadedFile[]) => void;
  /** Called when new files are selected (for initiating upload logic). */
  onFilesSelected?: (files: File[]) => void;
  /** Maximum number of files. Defaults to `10`. */
  maxFiles?: number;
  /** Maximum file size in bytes. Defaults to 10 MB. */
  maxSizeBytes?: number;
  /** Accepted MIME types (comma-separated) or extensions. */
  accept?: string;
  /** Whether the uploader is disabled. */
  disabled?: boolean;
  /** Additional class names. */
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

let fileIdCounter = 0;
function generateFileId(): string {
  fileIdCounter += 1;
  return `file-${Date.now()}-${fileIdCounter}`;
}

/**
 * FileUpload — a generic file upload component with progress tracking
 * and file type validation.
 *
 * @example
 * ```tsx
 * const [files, setFiles] = React.useState<UploadedFile[]>([]);
 *
 * <FileUpload
 *   value={files}
 *   onChange={setFiles}
 *   onFilesSelected={(newFiles) => {
 *     // Start upload logic
 *     newFiles.forEach(file => uploadFile(file));
 *   }}
 *   accept=".pdf,.docx,.xlsx"
 *   maxFiles={5}
 * />
 * ```
 */
function FileUpload({
  value = [],
  onChange,
  onFilesSelected,
  maxFiles = 10,
  maxSizeBytes = 10 * 1024 * 1024,
  accept,
  disabled = false,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const canAddMore = value.length < maxFiles;

  const validateAndProcessFiles = React.useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const remainingSlots = maxFiles - value.length;

      const validFiles: File[] = [];
      const newEntries: UploadedFile[] = [];

      for (const file of files.slice(0, remainingSlots)) {
        // Validate file size
        if (file.size > maxSizeBytes) {
          newEntries.push({
            id: generateFileId(),
            name: file.name,
            size: file.size,
            type: file.type,
            error: `File exceeds ${formatFileSize(maxSizeBytes)} limit`,
          });
          continue;
        }

        // Validate type if accept is specified
        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim());
          const isValid = acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            return file.type.match(type.replace('*', '.*'));
          });
          if (!isValid) {
            newEntries.push({
              id: generateFileId(),
              name: file.name,
              size: file.size,
              type: file.type,
              error: 'File type not accepted',
            });
            continue;
          }
        }

        const entry: UploadedFile = {
          id: generateFileId(),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
        };
        newEntries.push(entry);
        validFiles.push(file);
      }

      const updatedFiles = [...value, ...newEntries];
      onChange(updatedFiles);

      if (validFiles.length > 0) {
        onFilesSelected?.(validFiles);
      }
    },
    [accept, maxFiles, maxSizeBytes, onChange, onFilesSelected, value]
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
      validateAndProcessFiles(e.dataTransfer.files);
    },
    [disabled, canAddMore, validateAndProcessFiles]
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        validateAndProcessFiles(e.target.files);
      }
      e.target.value = '';
    },
    [validateAndProcessFiles]
  );

  const handleRemove = React.useCallback(
    (id: string) => {
      onChange(value.filter((f) => f.id !== id));
    },
    [onChange, value]
  );

  return (
    <div className={cn('space-y-4', className)}>
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
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-sm transition-colors',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <span className="font-medium text-foreground">
              Click to upload
            </span>{' '}
            <span className="text-muted-foreground">or drag and drop</span>
          </div>
          {accept && (
            <p className="text-xs text-muted-foreground">
              Accepted: {accept}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Max {formatFileSize(maxSizeBytes)} per file
            {maxFiles > 1 && ` · ${value.length}/${maxFiles} files`}
          </p>
        </button>
      )}

      {/* File list */}
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file) => (
            <li
              key={file.id}
              className={cn(
                'flex items-center gap-3 rounded-md border p-3',
                file.error && 'border-destructive/50 bg-destructive/5'
              )}
            >
              <File className="h-5 w-5 shrink-0 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>

                {file.error ? (
                  <p className="text-xs text-destructive">{file.error}</p>
                ) : file.progress !== undefined && file.progress < 100 ? (
                  <div className="mt-1.5">
                    <Progress value={file.progress} className="h-1.5" />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                disabled={disabled}
                className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
FileUpload.displayName = 'FileUpload';

export { FileUpload, formatFileSize };
