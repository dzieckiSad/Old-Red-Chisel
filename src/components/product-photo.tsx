import Image, { type StaticImageData } from "next/image";
import athloneSideboard from "@/assets/products/athlone-sideboard.jpg";
import bespokeBar from "@/assets/products/bespoke-bar.jpg";
import floatingShelves from "@/assets/products/floating-shelves.jpg";
import hallCabinet from "@/assets/products/hall-cabinet.jpg";
import loughReeLocker from "@/assets/products/lough-ree-bedside-locker.jpg";
import mediaUnit from "@/assets/products/media-unit.jpg";
import midlandsHomeBar from "@/assets/products/midlands-home-bar.jpg";
import oakChoppingBoard from "@/assets/products/oak-chopping-board.jpg";
import shannonLocker from "@/assets/products/shannon-bedside-locker.jpg";
import { PhotoPlaceholder } from "@/components/ui";
import type { ProductImage } from "@/lib/catalog";

/** Drawn example images of the sample products, used until real photos are uploaded. */
const samples: Record<string, StaticImageData> = {
  "athlone-sideboard": athloneSideboard,
  "bespoke-bar": bespokeBar,
  "floating-shelves": floatingShelves,
  "hall-cabinet": hallCabinet,
  "lough-ree-bedside-locker": loughReeLocker,
  "media-unit": mediaUnit,
  "midlands-home-bar": midlandsHomeBar,
  "oak-chopping-board": oakChoppingBoard,
  "shannon-bedside-locker": shannonLocker,
};

/**
 * A product photo filling its box, or the wood placeholder when there's no photo yet.
 * "sample:<slug>" images are the bundled example images and carry an "example image" tag.
 */
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
  const sample = image.url.startsWith("sample:") ? samples[image.url.slice(7)] : undefined;
  if (image.url.startsWith("sample:") && !sample) return <PhotoPlaceholder className={className} />;
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image src={sample ?? image.url} alt={image.alt || alt} fill sizes={sizes} priority={priority} placeholder={sample ? "blur" : "empty"} className="object-cover" />
      {sample && (
        <span className="pointer-events-none absolute bottom-2 left-2 bg-ink/60 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
          Example image
        </span>
      )}
    </div>
  );
}

