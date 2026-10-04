/** A hand-written workshop tag on a string, marking a product as new. */
export function NewTag({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-8 w-[68px] -rotate-6 items-center justify-end pr-3 drop-shadow-sm ${className}`}>
      <svg aria-hidden viewBox="0 0 68 32" className="absolute inset-0 h-full w-full overflow-visible">
        {/* string through the hole */}
        <path d="M12 16 C 7 9, 4 5, -3 3" fill="none" className="stroke-ink/60" strokeWidth="1.2" strokeLinecap="round" />
        {/* tag body with a pointed end */}
        <path d="M16 2.5 H63.5 a2 2 0 0 1 2 2 V27.5 a2 2 0 0 1 -2 2 H16 L3.5 16 Z" className="fill-cream stroke-brand" strokeWidth="1.6" strokeLinejoin="round" />
        {/* stitched edge */}
        <path d="M17.5 5.5 H62.5 V26.5 H17.5 L7.5 16 Z" fill="none" className="stroke-brand/45" strokeWidth=".9" strokeDasharray="2.2 2" strokeLinejoin="round" />
        {/* eyelet */}
        <circle cx="12" cy="16" r="2.4" className="fill-white stroke-brand" strokeWidth="1.2" />
      </svg>
      <span className="font-hand relative text-xl leading-none font-bold text-brand">New</span>
    </span>
  );
}
