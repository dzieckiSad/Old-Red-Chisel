"use client";

import { useState } from "react";
import { ProductPhoto } from "@/components/product-photo";
import type { ProductImage } from "@/lib/catalog";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <ProductPhoto alt={name} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-square" />;
  }
  return (
    <div className="grid gap-3">
      <ProductPhoto image={images[active]} alt={name} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-square" priority />
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`relative border-2 transition-colors ${i === active ? "border-brand" : "border-transparent hover:border-line"}`}
            >
              <ProductPhoto image={img} alt="" sizes="120px" className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
