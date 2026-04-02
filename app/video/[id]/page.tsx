import Link from "next/link";
import { getAssetStatus, getSignedPlaybackToken, getCurrentUser } from "@/app/actions";
import MuxPlayerWrapper from "@/components/MuxPlayerWrapper";
import VideoStatusPoller from "@/components/VideoStatusPoller";
import VideoSummary from "@/components/VideoSummary";
import ShareButton from "@/components/ShareButton";
import DeleteRecordingButton from "@/components/DeleteRecordingButton";
import { ArrowLeft, Download, Lock } from "lucide-react";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [status, tokenData] = await Promise.all([
    getAssetStatus(id),
    getSignedPlaybackToken(id),
  ]);

  const token = "videoToken" in tokenData ? tokenData.videoToken : undefined;
  const shortId = id.slice(-6);
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/20">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="relative z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4"
          aria-label="Video page navigation"
        >
          <Link
            href="/app"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group flex-shrink-0"
            aria-label="Back to app"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
              aria-hidden="true"
            />
            <span className="hidden xs:inline">Back</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ShareButton />
            {currentUser && (
              <DeleteRecordingButton
                playbackId={id}
                label={`Recording ${shortId}`}
                variant="inline"
                redirectTo="/app"
              />
            )}
            {status.status === "ready" && (
              <a
                href={`https://stream.mux.com/${id}/low.mp4?download=recording.mp4${token ? `&token=${token}` : ""}`}
                download
                className="btn btn-primary rounded-xl text-sm"
                aria-label={`Download recording ${shortId}`}
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}
          </div>
        </nav>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main
        id="main-content"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Video + meta */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Recording{" "}
                <span className="gradient-text-blue">#{shortId}</span>
              </h1>
              <div
                className="status-badge"
                aria-label={`Video status: ${status.status}`}
              >
                <span
                  className={`status-dot ${
                    status.status === "ready"
                      ? "status-dot--ready"
                      : "status-dot--processing"
                  }`}
                  aria-hidden="true"
                />
                {status.status}
              </div>
            </div>

            {/* Player */}
            <div
              className="glass rounded-3xl overflow-hidden shadow-2xl bg-black/40 relative aspect-video"
              role="region"
              aria-label="Video player"
            >
              {!token ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-sm gap-4 p-6">
                  <div
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-lg">Authentication Required</p>
                    <p className="text-sm text-muted-foreground">
                      Please log in to watch this recording.
                    </p>
                  </div>
                </div>
              ) : status.status === "ready" ? (
                <MuxPlayerWrapper
                  playbackId={id}
                  title={`Recording ${shortId}`}
                  token={token}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-sm gap-4">
                  <div
                    className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
                    aria-hidden="true"
                  />
                  <div className="text-center space-y-1">
                    <p className="font-bold">Video is processing</p>
                    <p className="text-sm text-muted-foreground">
                      Usually takes less than a minute
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-sm">
              This recording was captured and processed via Screeder. Use the
              AI-generated transcript on the right to navigate and review the
              content.
            </p>

            {/* AI Summary */}
            {token && <VideoSummary playbackId={id} />}
          </div>

          {/* Sidebar — transcript & status */}
          <aside
            className="lg:col-span-1"
            aria-label="Recording status and transcript"
          >
            <VideoStatusPoller playbackId={id} />
          </aside>
        </div>
      </main>
    </div>
  );
}
