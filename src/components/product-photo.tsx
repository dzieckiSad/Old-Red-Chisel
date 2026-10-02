import Image from "next/image";
import { PhotoPlaceholder } from "@/components/ui";
import type { ProductImage } from "@/lib/catalog";

/** A product photo filling its box, or the wood placeholder when there's no photo yet. */
export function ProductPhoto({
  image,
  alt,
  sizes,
  className = "",
  priority,
}: {
  image?: ProductImage;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  if (!image) return <PhotoPlaceholder className={className} />;
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image src={image.url} alt={image.alt || alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
