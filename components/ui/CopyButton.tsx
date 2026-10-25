"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-white hover:text-ink-900"
      aria-label={label}
      title={label}
    >
      {copied ? <Check size={16} className="text-mint-500" /> : <Copy size={16} />}
    </button>
  );
}
