"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssetStatus } from "@/app/actions";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";

interface TranscriptItem {
  time: string;
  text: string;
}

interface VideoStatusPollerProps {
  playbackId: string;
}

export default function VideoStatusPoller({
  playbackId,
}: VideoStatusPollerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("preparing");
  const [transcriptStatus, setTranscriptStatus] =
    useState<string>("preparing");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const poll = async () => {
      try {
        const result = await getAssetStatus(playbackId);

        if (result && result.status) {
          setStatus(result.status);
          setTranscriptStatus(result.transcriptStatus || "preparing");
          setTranscript(result.transcript || []);

          if (result.status === "ready") {
            router.refresh();
            // Keep polling for the transcript to finish updating its status card
            if (result.transcriptStatus === "ready") {
              clearInterval(interval);
            }
          }

          if (result.status === "errored") {
            setError(
              "Mux encountered an error processing this video. Please try recording again.",
            );
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
    interval = setInterval(poll, 3000);

    return () => clearInterval(interval);
  }, [playbackId]);

  /* ── Status card helper ────────────────────────────── */
  const StatusCard = ({
    label,
    currentStatus,
  }: {
    label: string;
    currentStatus: string;
  }) => {
    const isReady = currentStatus === "ready";
    const isErrored = currentStatus === "errored";
    return (
      <div
        className="glass p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md"
        role="status"
        aria-live="polite"
        aria-label={`${label}: ${currentStatus}`}
      >
        <div
          className={`p-2 rounded-xl flex-shrink-0 transition-colors duration-300 backdrop-blur-md ${
            isReady
              ? "bg-green-500/12"
              : isErrored
                ? "bg-red-500/12"
                : "bg-primary/10"
          }`}
          aria-hidden="true"
        >
          {isReady ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : isErrored ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-sm font-semibold capitalize mt-0.5">
            {currentStatus}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        <StatusCard label="Video" currentStatus={status} />
        <StatusCard label="Transcript" currentStatus={transcriptStatus} />
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Transcript section */}
      <section aria-labelledby="transcript-heading">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <FileText className="w-4 h-4" aria-hidden="true" />
          <h2
            id="transcript-heading"
            className="text-xs font-bold uppercase tracking-widest"
          >
            Transcript
          </h2>
        </div>

        <div className="glass rounded-3xl overflow-hidden">
          <div
            className="max-h-[420px] overflow-y-auto custom-scrollbar p-5 space-y-5"
            tabIndex={0}
            role="region"
            aria-label="Video transcript"
            aria-live="polite"
          >
            {transcript.length > 0 ? (
              transcript.map((item, index) => (
                <div key={index} className="flex gap-3 group">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 backdrop-blur-sm text-[10px] font-mono text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-200 cursor-default">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <time>{item.time}</time>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed text-sm group-hover:text-primary transition-colors duration-200">
                    {item.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-3" aria-busy="true">
                <div
                  className="inline-flex p-3 rounded-full bg-white/5 backdrop-blur-sm"
                  aria-hidden="true"
                >
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {transcriptStatus === "preparing"
                    ? "Generating AI transcript… this might take a minute."
                    : "No transcript available yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
