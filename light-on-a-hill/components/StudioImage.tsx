import Image from "next/image";
import { IMAGES, objectPosition, src, type ImageKey } from "@/content/images";

/**
 * Photography-first image primitive. Wraps next/image with the studio image map
 * so alt text, focal point, and responsive sizing are consistent everywhere.
 * `priority` is reserved for the hero — never lazy-load the LCP image.
 */
export function StudioImage({
  image,
  sizes = "100vw",
  priority = false,
  className,
  widthHint = 1600,
}: {
  image: ImageKey;
  sizes?: string;
  priority?: boolean;
  className?: string;
  widthHint?: number;
}) {
  const img = IMAGES[image];
  return (
    <Image
      src={src(img, widthHint)}
      alt={img.alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
      style={{ objectFit: "cover", objectPosition: objectPosition(img) }}
    />
  );
}
