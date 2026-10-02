// Hand-drawn icon set. Each icon is drawn on a 48×48 grid; "lines" are pencil strokes in
// graphite and "accent" strokes are in brand red. The pencil wobble comes from the SVG
// filters in <SketchDefs />, which must be rendered once per page (see app/layout.tsx).

type IconDef = { lines: string; accent?: string };

const icons = {
  kitchen: {
    lines: "M6 8h36v11H6z M24 8v11 M6 27h36v15H6z M6 31h36 M18 31v11 M30 31v11 M14 35v3 M22 35v3 M34 35v3",
    accent: "M3 27h42 M28 27v-4 M36 27v-4",
  },
  wardrobe: {
    lines: "M10 4h28v40H10z M24 4v40 M10 37h28 M8 44h4 M36 44h4",
    accent: "M21 19v7 M27 19v7",
  },
  shelving: {
    lines: "M8 5h32v38H8z M8 16h32 M8 27h32 M8 35h32 M24 35v8",
    accent: "M12 16v-7 M15.5 16v-6 M19 16v-8 M30 27l4-7",
  },
  stairs: {
    lines: "M4 42h40 M4 42V35h8v-8h8v-8h8v-8h8V5h8",
    accent: "M12 42v-5h14v5 M17 39.5h4",
  },
  desk: {
    lines: "M4 25h40 M8 25v17 M40 25v17 M28 25v17 M28 32h12 M14 9h16v11H14z",
    accent: "M22 20v5 M18 25h8 M32 36h4",
  },
  interior: {
    lines: "M8 6h18v36H8z M22 25h1 M4 42h40",
    accent: "M31 8h12v6H31z M37 14v4h-6v6 M31 24v9",
  },
  exterior: {
    lines: "M6 34V14l3-4 3 4v20 M15 34V14l3-4 3 4v20 M24 34V14l3-4 3 4v20 M33 34V14l3-4 3 4v20 M3 19h40 M3 29h40",
    accent: "M2 39h44 M2 44h44",
  },
  extension: {
    lines: "M4 22L19 9l15 13 M9 18v24h20V18 M16 42v-9h6v9 M29 27h14v15H29",
    accent: "M36 31v7 M32.5 34.5h7",
  },
  hammer: {
    lines: "M6 14l8-8 4 4 6-2 2 2-2 6 4 4-8 8-4-4-6-6z M21 23l18 18-3 3-18-18",
    accent: "M38 6v12 M34 6h8",
  },
  camera: {
    lines: "M5 16h9l3-5h14l3 5h9v24H5z M24 21a7 7 0 1 0 .01 0",
    accent: "M24 26a2 2 0 1 0 .01 0 M36 20h3",
  },
  clipboard: {
    lines: "M11 8h26v36H11z M19 5h10v6H19z M17 20h14 M17 26h14 M17 32h7",
    accent: "M27 36l3 3 7-8",
  },
  tape: {
    lines: "M5 13h23v23H5z M16.5 19.5a5 5 0 1 0 .01 0",
    accent: "M28 30h16v6H28z M32 30v3 M36 30v3 M40 30v3",
  },
  chisel: {
    lines: "M5 37l6 6 11-11-6-6z M16 26l6 6",
    accent: "M19 23l13-13 6 6-13 13z M32 10l5-4 5 5-4 5",
  },
  houseCheck: {
    lines: "M5 22L24 6l19 16 M10 18v25h28V18",
    accent: "M17 30l5 5 9-10",
  },
  plane: {
    lines: "M6 33h33l-4-10H13z M11 23v-5h6v5 M27 23c0-7 7-9 10-4l-3 4 M3 37h40",
    accent: "M39 33c4-2 7 2 4 5-2 2-4 0-3-2",
  },
  team: {
    lines: "M15 15a5 5 0 1 0 .01 0 M33 15a5 5 0 1 0 .01 0 M5 41c0-10 5-15 10-15s10 5 10 15 M23 41c0-10 5-15 10-15s10 5 10 15",
    accent: "M27 13c0-6 12-6 12 0z M25 13h16",
  },
  clock: {
    lines: "M24 5a19 19 0 1 0 .01 0 M24 9v3 M39 24h-3 M24 39v-3 M9 24h3",
    accent: "M24 14v10l7 5",
  },
  shield: {
    lines: "M24 4l17 6v13c0 10-7 18-17 21C14 41 7 33 7 23V10z",
    accent: "M16 24l6 6 10-11",
  },
  van: {
    lines: "M3 13h25v21H3z M28 19h9l7 8v7H28 M12 30a4 4 0 1 0 .01 0 M35 30a4 4 0 1 0 .01 0",
    accent: "M30 21h6l5 6H30z",
  },
  phone: {
    lines: "M14 4h20v40H14z M14 9h20 M14 37h20",
    accent: "M22 40.5h4",
  },
  chat: {
    lines: "M24 6c10 0 18 7 18 16s-8 16-18 16c-3 0-6-1-8-2l-9 3 3-8c-3-3-4-6-4-9 0-9 8-16 18-16z",
    accent: "M16 22h.5 M24 22h.5 M32 22h.5",
  },
  mail: {
    lines: "M5 11h38v27H5z",
    accent: "M5 11l19 15 19-15",
  },
  pin: {
    lines: "M24 44S11 31 11 21a13 13 0 1 1 26 0c0 10-13 23-13 23z",
    accent: "M24 16a5 5 0 1 0 .01 0",
  },
  tick: { lines: "", accent: "M8 25l10 10L40 11" },
  arrow: { lines: "", accent: "M5 24h34 M29 14l11 10-11 10" },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];

export function SketchIcon({
  name,
  size = 48,
  className = "",
  title,
}: {
  name: IconName;
  size?: number;
  className?: string;
  title?: string;
}) {
  const icon: IconDef = icons[name];
  return (
    <svg
      viewBox="-2 -2 52 52"
      width={size}
      height={size}
      className={`sketch-icon shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* faint second pass, like a pencil line drawn twice */}
      <g filter="url(#sketch-b)" strokeWidth={1.2} opacity={0.55} transform="translate(0.9 0.7)">
        {icon.lines && <path d={icon.lines} stroke="var(--sketch-ink, #3c3835)" />}
        {icon.accent && <path d={icon.accent} stroke="var(--sketch-accent, #b33938)" />}
      </g>
      <g filter="url(#sketch-a)" strokeWidth={2}>
        {icon.lines && <path d={icon.lines} stroke="var(--sketch-ink, #3c3835)" />}
        {icon.accent && <path d={icon.accent} stroke="var(--sketch-accent, #b33938)" />}
      </g>
    </svg>
  );
}

/** Shared pencil filters. Render once, near the top of <body>. */
export function SketchDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <filter id="sketch-a" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
        <filter id="sketch-b" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="4.2" />
        </filter>
        <filter id="sketch-line" x="-5%" y="-50%" width="110%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>
    </svg>
  );
}
