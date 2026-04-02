"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteAsset } from "@/app/actions";

interface DeleteRecordingButtonProps {
  playbackId: string;
  label?: string;
  /** "card" = hover-reveal icon on a grid card (default)
   *  "inline" = always-visible ghost button in a nav bar   */
  variant?: "card" | "inline";
  /** Navigate here after deletion instead of router.refresh() */
  redirectTo?: string;
}

export default function DeleteRecordingButton({
  playbackId,
  label = "this recording",
  variant = "card",
  redirectTo,
}: DeleteRecordingButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Portal target only available after hydration
  useEffect(() => { setMounted(true); }, []);

  const openConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const closeConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
    setError(null);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteAsset(playbackId);
      if ("error" in result && result.error) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  /* ── Confirm dialog — rendered via Portal at <body> level ──────────
     This escapes any ancestor backdrop-filter / stacking context that
     would break position:fixed centering (e.g. the sticky nav header). */
  const confirmDialog = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-background/80 dark:bg-black/60 backdrop-blur-sm z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-label={`Confirm deletion of ${label}`}
      onClick={closeConfirm}
    >
      {/* Stop clicks on the card itself from closing or bubbling */}
      <div
        className="glass rounded-2xl p-6 shadow-2xl w-[300px] space-y-4 border border-red-500/20"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold">Delete recording?</p>
            <p className="text-xs text-muted-foreground mt-1">
              This cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={closeConfirm}
            disabled={isDeleting}
            className="btn btn-ghost rounded-lg flex-1 text-sm"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-danger rounded-lg flex-1 text-sm"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Inline variant (nav bar) ───────────────────────────────────── */
  if (variant === "inline") {
    return (
      <>
        <button
          onClick={openConfirm}
          className="btn btn-ghost rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
          aria-label={`Delete ${label}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Delete</span>
        </button>
        {mounted && showConfirm && createPortal(confirmDialog, document.body)}
      </>
    );
  }

  /* ── Card variant (grid cards) ──────────────────────────────────── */
  return (
    <>
      <button
        onClick={openConfirm}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Delete ${label}`}
        title={`Delete ${label}`}
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {mounted && showConfirm && createPortal(confirmDialog, document.body)}
    </>
  );
}
