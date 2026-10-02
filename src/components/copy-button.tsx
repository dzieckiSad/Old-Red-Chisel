"use client";

import { useState } from "react";
import { SketchIcon } from "@/components/sketch/icons";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // clipboard blocked: the value is still on screen to copy by hand
        }
      }}
      className="flex items-center gap-1 text-xs font-semibold text-graphite hover:text-brand"
    >
      <SketchIcon name={copied ? "tick" : "clipboard"} size={20} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
