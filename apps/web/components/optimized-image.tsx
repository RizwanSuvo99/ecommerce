'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  fallbackSrc?: string;
  aspectRatio?: 'square' | '4:3' | '16:9' | '3:4' | 'auto';
  showSkeleton?: boolean;
}

const ASPECT_RATIOS = {
  square: 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '3:4': 'aspect-[3/4]',
  auto: '',
};

const FALLBACK_IMAGE = '/images/placeholder.jpg';

const IMAGE_LOADER = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (src.startsWith('http')) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  return src;
};

export function OptimizedImage({
  fallbackSrc = FALLBACK_IMAGE,
  aspectRatio = 'auto',
  showSkeleton = true,
  className = '',
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectClass = ASPECT_RATIOS[aspectRatio];

  return (
    <div className={`relative overflow-hidden ${aspectClass} ${className}`}>
      {/* Skeleton loader */}
      {showSkeleton && isLoading && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      <Image
        {...props}
        alt={alt}
        src={hasError ? fallbackSrc : props.src}
        loader={IMAGE_LOADER}
        quality={props.quality || 80}
        loading={props.priority ? undefined : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${props.fill ? 'object-cover' : ''}`}
        sizes={
          props.sizes ||
          '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
        }
      />
    </div>
  );
}

// Presets for common use cases
export function ProductImage({
  src,
  alt,
  size = 'md',
  ...props
}: Omit<OptimizedImageProps, 'aspectRatio' | 'fill'> & { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { width: 150, height: 150, imgSizes: '150px' },
    md: { width: 300, height: 300, imgSizes: '(max-width: 640px) 50vw, 300px' },
    lg: { width: 600, height: 600, imgSizes: '(max-width: 768px) 100vw, 600px' },
  };

  const s = sizes[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={s.width}
      height={s.height}
      sizes={s.imgSizes}
      aspectRatio="square"
      {...props}
    />
  );
}

export function BannerImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'aspectRatio'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      aspectRatio="16:9"
      priority
      {...props}
    />
  );
}

export function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={64}
      height={64}
      sizes="64px"
      aspectRatio="square"
      showSkeleton={false}
      className="rounded-md"
    />
  );
}
