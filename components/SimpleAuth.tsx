"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, LogIn, Loader2 } from "lucide-react";

interface SimpleAuthProps {
  currentUser: string | null;
}

export default function SimpleAuth({ currentUser }: SimpleAuthProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      await fetch("/api/fake-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/fake-login", { method: "DELETE" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Logged-in state ──────────────────────────────── */
  if (currentUser) {
    return (
      <div
        className="glass px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 sm:gap-3 shadow-lg shadow-black/20"
        role="status"
        aria-label={`Signed in as ${currentUser}`}
      >
        {/* Avatar */}
        <div
          className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <User className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-muted-foreground text-sm font-medium leading-none truncate max-w-[60px] sm:max-w-none">
          {currentUser}
        </span>

        <div className="w-px h-4 bg-white/10 flex-shrink-0" aria-hidden="true" />

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Log out"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            />
          )}
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    );
  }

  /* ── Login form ───────────────────────────────────── */
  return (
    <form
      onSubmit={handleLogin}
      className="glass p-1 pl-3 sm:pl-4 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-black/20 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-250"
      aria-label="Login form"
    >
      <label htmlFor="username-input" className="sr-only">
        Username
      </label>
      <input
        id="username-input"
        type="text"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username…"
        className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-24 xs:w-32 sm:w-48 focus:ring-0"
        disabled={isLoading}
        aria-required="true"
      />
      <button
        type="submit"
        disabled={isLoading || !username.trim()}
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        style={{ borderRadius: "50%" }}
        aria-label="Log in"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
        ) : (
          <LogIn className="w-4 h-4 text-primary-foreground" />
        )}
      </button>
    </form>
  );
}
