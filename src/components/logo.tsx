import Image from "next/image";

// Intrinsic size of public/brand/logo.svg (viewBox -4 -4 1017 368).
const LOGO_WIDTH = 1017;
const LOGO_HEIGHT = 368;

type LogoProps = {
  /** Rendered width in px. Give either width or height; the other follows the logo's ratio. */
  width?: number;
  /** Rendered height in px. */
  height?: number;
  /** "light" for light backgrounds, "dark" for dark ones (white lettering). */
  variant?: "light" | "dark";
  priority?: boolean;
  className?: string;
};

export function Logo({ width, height, variant = "light", priority, className }: LogoProps) {
  const w = width ?? (height ? Math.round((height * LOGO_WIDTH) / LOGO_HEIGHT) : 200);
  const h = height ?? Math.round((w * LOGO_HEIGHT) / LOGO_WIDTH);
  return (
    <Image
      src={variant === "dark" ? "/brand/logo-on-dark.svg" : "/brand/logo.svg"}
      alt="Old Red Chisel Home Improvements"
      width={w}
      height={h}
      priority={priority}
      className={className}
    />
  );
}
