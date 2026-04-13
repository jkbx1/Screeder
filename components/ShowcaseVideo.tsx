"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ShowcaseVideoProps {
  sources: { src: string; type: string }[];
  ariaLabel: string;
  title: string;
}

export default function ShowcaseVideo({ sources, ariaLabel, title }: ShowcaseVideoProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [morphStyles, setMorphStyles] = useState<React.CSSProperties>({});

  const calculateTargetRect = () => {
    const isMobile = window.innerWidth < 640;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    
    // Video aspect ratio 16:10
    const videoAspect = 16 / 10;
    
    let targetWidth, targetHeight;
    
    if (isMobile) {
      // For mobile rotation, we want the long side of the video (16) to fit the screen height (vh)
      // and the short side (10) to fit the screen width (vw)
      targetWidth = Math.min(vh * 0.9, vw * 0.9 * videoAspect);
      targetHeight = targetWidth / videoAspect;
    } else {
      targetWidth = Math.min(vw * 0.9, vh * 0.9 * videoAspect);
      targetHeight = targetWidth / videoAspect;
    }

    const top = (vh - targetHeight) / 2;
    const left = (vw - targetWidth) / 2;

    return { top, left, width: targetWidth, height: targetHeight, isMobile };
  };

  const openFullscreen = useCallback(() => {
    if (isFullscreen) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const target = calculateTargetRect();

    // 1. Snapshot the initial state
    setMorphStyles({
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 100,
      borderRadius: '1.5rem',
      transition: 'none',
      transform: 'rotate(0deg)',
      opacity: 1,
    });

    setIsFullscreen(true);
    setIsExpanding(true);

    // 2. Animate directly to the target state
    requestAnimationFrame(() => {
      setShowBackdrop(true);
      requestAnimationFrame(() => {
        setMorphStyles({
          position: 'fixed',
          top: target.top,
          left: target.left,
          width: target.width,
          height: target.height,
          zIndex: 100,
          borderRadius: target.isMobile ? '0.75rem' : '1.5rem',
          transform: target.isMobile ? 'rotate(90deg)' : 'rotate(0deg)',
          opacity: 1,
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        });
      });
    });

    setTimeout(() => {
      setIsExpanding(false);
    }, 400);
  }, [isFullscreen]);

  const closeFullscreen = useCallback(() => {
    const originalContainer = containerRef.current;
    if (!originalContainer) {
      setIsFullscreen(false);
      return;
    }

    const rect = originalContainer.getBoundingClientRect();
    setIsClosing(true);
    setShowBackdrop(false);

    // Animate back to the thumbnail
    setMorphStyles(prev => ({
      ...prev,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: '1.5rem',
      transform: 'rotate(0deg)',
      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    }));

    setTimeout(() => {
      setIsFullscreen(false);
      setIsClosing(false);
      setMorphStyles({});
    }, 400);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) closeFullscreen();
    };
    if (isFullscreen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, closeFullscreen]);

  return (
    <>
      <div 
        ref={containerRef}
        onClick={openFullscreen}
        className={`flex-1 w-full relative aspect-[16/10] rounded-3xl glass border border-white/10 overflow-hidden group shadow-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${isFullscreen && !isClosing ? 'invisible' : 'visible'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            aria-label={ariaLabel}
            title={title}
            className="w-full h-full object-cover"
          >
            {sources.map((s, i) => <source key={i} src={s.src} type={s.type} />)}
          </video>
        </div>
      </div>

      {isFullscreen && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-400 ${showBackdrop && !isClosing ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFullscreen();
          }}
        >
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); closeFullscreen(); }}
            className={`absolute top-6 right-6 z-[110] p-3 rounded-full glass hover:bg-white/20 transition-all text-white scale-110 active:scale-95 ${isExpanding || isClosing ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
            style={{ transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1) 0.3s' }}
            aria-label="Exit fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Morphing Video Container */}
          <div 
            style={morphStyles}
            className="overflow-hidden shadow-2xl bg-black"
          >
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover rounded-[inherit]"
            >
              {sources.map((s, i) => <source key={i} src={s.src} type={s.type} />)}
            </video>
          </div>
        </div>
      )}
    </>
  );
}
