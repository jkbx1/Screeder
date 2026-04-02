import ScreenRecorder from "@/components/ScreenRecorder";
import VideoThumbnail from "@/components/VideoThumbnail";
import SimpleAuth from "@/components/SimpleAuth";
import ThemeToggle from "@/components/ThemeToggle";
import DeleteRecordingButton from "@/components/DeleteRecordingButton";
import {
  listVideos,
  getSignedPlaybackToken,
  getCurrentUser,
} from "@/app/actions";
import { Play, Calendar, Clock, LayoutGrid, Lock } from "lucide-react";
import Link from "next/link";

export default async function AppHome() {
  // ── Authorization boundary ────────────────────────────────────────────────
  // getCurrentUser() reads an HTTP-only cookie set by /api/fake-login.
  // Swap this call for your real auth provider (NextAuth, Clerk, etc.) and
  // the rest of the page will automatically show/hide recordings.
  const currentUser = await getCurrentUser();

  // Only fetch recordings & signed tokens when the user is authenticated.
  // This avoids unnecessary Mux API calls for guests and keeps routes clean.
  const videosWithTokens = currentUser
    ? await (async () => {
        const videos = await listVideos();
        return Promise.all(
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
      })()
    : null;

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/20">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3"
          aria-label="Main navigation"
        >
          {/* Brand mark */}
          <Link href="/" className="text-lg font-bold gradient-text tracking-tight select-none">
            Screeder
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SimpleAuth currentUser={currentUser} />

            <Link
              href="/dashboard"
              className="btn btn-ghost rounded-full text-sm"
              aria-label="Go to My Recordings dashboard"
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">My Recordings</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        {/* Hero */}
        <section
          className="text-center mb-16 sm:mb-20 space-y-5 animate-fade-in-up"
          aria-labelledby="hero-heading"
        >
          <div
            className="status-badge mx-auto w-fit"
            aria-label="Live recording platform"
          >
            <span
              className="status-dot status-dot--live"
              aria-hidden="true"
            />
            <span>Live Recording Platform</span>
          </div>

          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight gradient-text leading-[1.08]"
          >
            App
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Record, share, and analyze your screen with instant AI transcripts
            and high-performance playback.
          </p>
        </section>

        {/* Recorder */}
        <section className="mb-24 sm:mb-32" aria-label="Screen recorder">
          {currentUser ? (
            <div className="glass rounded-3xl p-3 sm:p-6 lg:p-8 shadow-2xl relative group">
              <div
                className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                aria-hidden="true"
              />
              <ScreenRecorder />
            </div>
          ) : (
            <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl relative flex flex-col items-center justify-center text-center gap-5 min-h-[400px]">
              <div
                className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center mb-2"
                aria-hidden="true"
              >
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Sign in to Record</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                You must be logged in to capture and upload screen recordings. Enter any username in the navigation bar above to get started.
              </p>
            </div>
          )}
        </section>

        {/* Recent Recordings — only rendered for authenticated users */}
        <section id="recent" aria-labelledby="recent-heading" className="space-y-8">
          {/* Section header — visible to all so the layout stays consistent */}
          <div className="flex items-end justify-between border-b border-white/8 pb-5">
            <div className="space-y-1">
              <h2
                id="recent-heading"
                className="text-2xl sm:text-3xl font-bold"
              >
                Recent Recordings
              </h2>
              <p className="text-muted-foreground text-sm">
                {currentUser
                  ? "Your latest shares and insights"
                  : "Sign in to view your recordings"}
              </p>
            </div>
            {/* Only show "View all" when authenticated */}
            {currentUser && (
              <Link
                href="/dashboard"
                className="text-xs font-medium text-primary hover:opacity-80 transition-opacity hidden sm:block"
              >
                View all →
              </Link>
            )}
          </div>

          {/* ── Guest: sign-in prompt ─────────────────────────────── */}
          {!currentUser ? (
            <div
              className="py-16 text-center glass rounded-3xl flex flex-col items-center gap-5"
              role="status"
              aria-label="Sign in to view recordings"
            >
              {/* Lock icon */}
              <div
                className="w-14 h-14 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-base">
                  Your recordings are private
                </p>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Log in with any username above to access and manage your
                  screen recordings.
                </p>
              </div>
            </div>
          ) : (
            /* ── Authenticated: recordings grid ───────────────────── */
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
              role="list"
            >
              {videosWithTokens && videosWithTokens.length > 0 ? (
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
                        {/* Play overlay */}
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                /* Empty state for authenticated users with no recordings yet */
                <div
                  className="col-span-full py-20 text-center glass rounded-3xl border-dashed flex flex-col items-center gap-4"
                  role="listitem"
                >
                  <p className="text-muted-foreground text-sm">
                    No recordings yet. Start your first recording above!
                  </p>
                  <a
                    href="#recorder"
                    className="btn btn-primary rounded-full text-sm px-5"
                  >
                    Start Recording
                  </a>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-10 text-center text-xs text-muted-foreground mt-20">
        <p>© {new Date().getFullYear()} Screeder. All rights reserved.</p>
      </footer>
    </div>
  );
}
