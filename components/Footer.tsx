import React from "react";
import { Github, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/5 py-12 text-center text-xs text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
        <div className="flex items-center gap-8">
          <a
            href="https://github.com/jkbx1"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-all duration-300 flex items-center gap-2 group"
          >
            <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">GitHub</span>
          </a>
          <a
            href="https://jakubbarszczak.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-all duration-300 flex items-center gap-2 group"
          >
            <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Portfolio</span>
          </a>
        </div>
        <p className="tracking-wide">
          © {new Date().getFullYear()} Screeder. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
