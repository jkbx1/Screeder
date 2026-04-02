"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn btn-ghost rounded-xl transition-all duration-300 group"
      aria-label={copied ? "Link copied to clipboard" : "Copy link to clipboard"}
      aria-pressed={copied}
    >
      {copied ? (
        <>
          <Check
            className="w-4 h-4 text-green-400 scale-110 transition-transform duration-200"
            aria-hidden="true"
          />
          <span className="text-green-400 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Share2
            className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
            aria-hidden="true"
          />
          <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
            Share
          </span>
        </>
      )}
    </button>
  );
}
