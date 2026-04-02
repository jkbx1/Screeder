import Link from "next/link";
import { Play, ArrowRight, Video, Sparkles, FileText } from "lucide-react";
import SimpleAuth from "@/components/SimpleAuth";
import ThemeToggle from "@/components/ThemeToggle";
import { getCurrentUser } from "@/app/actions";

export default async function LandingPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/20 flex flex-col items-center overflow-hidden">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/40 backdrop-blur-xl">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3"
          aria-label="Main navigation"
        >
          {/* Brand mark */}
          <span className="text-xl font-bold gradient-text tracking-tight select-none">
            Screeder
          </span>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SimpleAuth currentUser={currentUser} />
          </div>
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main id="main-content" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex-1 flex flex-col items-center py-24 lg:py-32">
        {/* Hero */}
        <section
          className="text-center space-y-8 animate-fade-in-up flex flex-col items-center max-w-3xl min-h-[70vh] justify-center"
          aria-labelledby="hero-heading"
        >
          <div className="space-y-4">
            <div
              className="status-badge mx-auto w-fit glass px-4 py-1.5 rounded-full border border-primary/30 flex items-center gap-2 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Demo Showcase Version</span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground border border-white/5 bg-white/5 rounded-2xl px-6 py-3 max-w-xl mx-auto backdrop-blur-md">
              To unlock full features like AI transcription and summaries, please download the repository from <strong>GitHub</strong>, add your own API keys, and run it locally.
            </p>
          </div>

          <h1
            id="hero-heading"
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-muted-foreground"
          >
            Capture your <br/>
            <span className="gradient-text">screen in magic.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground flex-1 leading-relaxed max-w-2xl">
            Record, share, and analyze your screen with instant AI transcripts
            and lightning-fast high-performance playback.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/app" className="group btn btn-primary rounded-full text-lg px-8 py-5 flex items-center gap-3 transition-all hover:scale-105">
              <Video className="w-5 h-5" />
              {currentUser ? "Continue to App" : "Start Recording"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* ── Features Showcase ────────────────────────────────────────── */}
        <section className="w-full mt-32 space-y-32 mb-20">
          {/* Feature 1: Recording */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 shadow-lg">
                <Video className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Lightning-fast recording</h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Capture your screen, camera, and microphone directly from your browser. We leverage standard Web APIs and integrate with <strong>Mux</strong> for instant, high-performance video hosting and smooth playback.
              </p>
            </div>
            <div className="flex-1 w-full relative aspect-[16/10] rounded-3xl glass border border-white/10 overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  aria-label="Lightning-fast recording demo"
                  title="Lightning-fast recording demo"
                  className="w-full h-full object-cover"
                >
                  <source src="/showcase/feature1.webm" type="video/webm" />
                  <source src="/showcase/feature1.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Feature 2: Transcripts */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 shadow-lg">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Instant AI transcripts</h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Never take notes during a meeting again. Screeder integrates seamlessly with <strong>Mux's Auto-Generated AI Captions</strong> to deliver highly accurate transcripts for every recording, making your videos completely searchable.
              </p>
            </div>
            <div className="flex-1 w-full relative aspect-[16/10] rounded-3xl glass border border-white/10 overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  aria-label="Instant AI transcripts demo"
                  title="Instant AI transcripts demo"
                  className="w-full h-full object-cover"
                >
                  <source src="/showcase/feature2.webm" type="video/webm" />
                  <source src="/showcase/feature2.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Feature 3: Summary */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 shadow-lg">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Smart AI summaries</h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Get the gist in seconds. Built on the powerful <strong>OpenAI API</strong>, our system analyzes your video transcripts to generate concise summaries and actionable takeaways so you can focus on what matters most.
              </p>
            </div>
            <div className="flex-1 w-full relative aspect-[16/10] rounded-3xl glass border border-white/10 overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  aria-label="Smart AI summaries demo"
                  title="Smart AI summaries demo"
                  className="w-full h-full object-cover"
                >
                  <source src="/showcase/feature3.webm" type="video/webm" />
                  <source src="/showcase/feature3.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-white/5 py-10 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Screeder. All rights reserved.</p>
      </footer>
    </div>
  );
}
