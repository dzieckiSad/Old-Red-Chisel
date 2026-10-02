import Image, { type StaticImageData } from "next/image";
import alcoveAfter from "@/assets/projects/alcove-after.jpg";
import alcoveBefore from "@/assets/projects/alcove-before.jpg";
import kitchenAfter from "@/assets/projects/kitchen-after.jpg";
import kitchenBefore from "@/assets/projects/kitchen-before.jpg";
import stairsAfter from "@/assets/projects/stairs-after.jpg";
import stairsBefore from "@/assets/projects/stairs-before.jpg";
import wardrobeAfter from "@/assets/projects/wardrobe-after.jpg";
import wardrobeBefore from "@/assets/projects/wardrobe-before.jpg";
import officeAfter from "@/assets/projects/office-after.jpg";
import officeBefore from "@/assets/projects/office-before.jpg";
import renovationAfter from "@/assets/projects/renovation-after.jpg";
import renovationBefore from "@/assets/projects/renovation-before.jpg";
import deckAfter from "@/assets/projects/deck-after.jpg";
import deckBefore from "@/assets/projects/deck-before.jpg";
import atticAfter from "@/assets/projects/attic-after.jpg";
import atticBefore from "@/assets/projects/attic-before.jpg";
import doorAfter from "@/assets/projects/door-after.jpg";
import doorBefore from "@/assets/projects/door-before.jpg";
import { PhotoPlaceholder } from "@/components/ui";
import type { ProjectImage, SampleImageName } from "@/lib/project-types";

const samples: Record<SampleImageName, StaticImageData> = {
  "alcove-before": alcoveBefore,
  "alcove-after": alcoveAfter,
  "wardrobe-before": wardrobeBefore,
  "wardrobe-after": wardrobeAfter,
  "stairs-before": stairsBefore,
  "stairs-after": stairsAfter,
  "kitchen-before": kitchenBefore,
  "kitchen-after": kitchenAfter,
  "office-before": officeBefore,
  "office-after": officeAfter,
  "renovation-before": renovationBefore,
  "renovation-after": renovationAfter,
  "deck-before": deckBefore,
  "deck-after": deckAfter,
  "attic-before": atticBefore,
  "attic-after": atticAfter,
  "door-before": doorBefore,
  "door-after": doorAfter,
};

/**
 * A project photo filling its box. "sample:<name>" images are the bundled example images and
 * carry a small "example image" tag until real photos replace them.
 */
export function ProjectPhoto({
  image,
  alt,
  sizes,
  className = "",
  priority,
}: {
  image?: ProjectImage | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  if (!image) return <PhotoPlaceholder className={className} />;
  const sample = image.url.startsWith("sample:") ? samples[image.url.slice(7) as SampleImageName] : undefined;
  if (image.url.startsWith("sample:") && !sample) return <PhotoPlaceholder className={className} />;
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image
        src={sample ?? image.url}
        alt={image.alt || alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={sample ? "blur" : "empty"}
        className="object-cover"
        draggable={false}
      />
      {sample && (
        <span className="pointer-events-none absolute bottom-2 left-2 bg-ink/60 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
          Example image
        </span>
      )}
    </div>
  );
}
