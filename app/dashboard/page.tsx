import Link from "next/link";
import {
  listVideos,
  getSignedPlaybackToken,
  getCurrentUser,
} from "@/app/actions";
import { ArrowLeft, Play, Calendar, Clock, Lock } from "lucide-react";
import VideoThumbnail from "@/components/VideoThumbnail";
import SimpleAuth from "@/components/SimpleAuth";
import ThemeToggle from "@/components/ThemeToggle";
import DeleteRecordingButton from "@/components/DeleteRecordingButton";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  const videos = await listVideos();

  const videosWithTokens = await Promise.all(
    (videos || []).map(async (video) => {
      const playbackId = video.playback_ids?.[0]?.id;
      if (!playbackId) return { ...video } as any;
      const tokenData = await getSignedPlaybackToken(playbackId);
      return {
        ...video,
        videoToken: "videoToken" in tokenData ? tokenData.videoToken : undefined,
        thumbnailToken: "thumbnailToken" in tokenData ? tokenData.thumbnailToken : undefined,
      } as any;
    }),
  );

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/20">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="relative z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4"
          aria-label="Dashboard navigation"
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
            <span>Back to App</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-semibold gradient-text">
              Screeder
            </span>
            <ThemeToggle />
            <SimpleAuth currentUser={currentUser} />
          </div>
        </nav>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main
        id="main-content"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16"
      >
        <header className="mb-10 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            All Recordings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and review your captured sessions
          </p>
        </header>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
          role="list"
        >
          {!currentUser ? (
            /* Auth required */
            <div
              className="col-span-full py-24 text-center glass rounded-3xl flex flex-col items-center gap-5"
              role="listitem"
            >
              <div
                className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center"
                aria-hidden="true"
              >
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  Authentication Required
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Please log in above to view your video recordings securely.
                </p>
              </div>
            </div>
          ) : videosWithTokens && videosWithTokens.length > 0 ? (
            videosWithTokens.map((video) => {
              const playbackId = video.playback_ids?.[0]?.id;
              const label = `Recording ${video.id.slice(-6)}`;
              return (
                <Link
                  key={video.id}
                  href={`/video/${playbackId}`}
                  className="group block card-hover glass rounded-2xl overflow-hidden relative"
                  role="listitem"
                  aria-label={`Open ${label}`}
                >
                  {/* Delete button — visible on hover */}
                  <DeleteRecordingButton
                    playbackId={playbackId || ""}
                    label={label}
                  />
                  {/* Thumbnail */}
                  <div className="aspect-video bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                    <VideoThumbnail
                      playbackId={playbackId || ""}
                      alt={`Thumbnail for ${label}`}
                      token={video.thumbnailToken}
                    />
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-hidden="true"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <time
                          dateTime={new Date(
                            Number(video.created_at) * 1000,
                          ).toISOString()}
                        >
                          {new Date(
                            Number(video.created_at) * 1000,
                          ).toLocaleDateString()}
                        </time>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{Math.round(video.duration || 0)}s</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                      {label}
                    </h3>
                  </div>
                </Link>
              );
            })
          ) : (
            /* Empty recordings */
            <div
              className="col-span-full py-24 text-center glass rounded-3xl border-dashed flex flex-col items-center gap-4"
              role="listitem"
            >
              <p className="text-muted-foreground text-sm">
                No recordings found.
              </p>
              <Link
                href="/app"
                className="btn btn-primary rounded-full text-sm px-5"
              >
                Record one now
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
