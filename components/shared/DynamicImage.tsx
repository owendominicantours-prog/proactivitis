"use client";

import type { ImgHTMLAttributes } from "react";

type DynamicImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  fallback?: string;
  alt: string;
};

export function DynamicImage({
  src,
  fallback = "/fototours/fototour.jpeg",
  alt,
  className,
  loading = "lazy",
  ...props
}: DynamicImageProps) {
  const resolvedSrc = src?.trim() ? src : fallback;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading={loading}
      {...props}
    />
  );
}
