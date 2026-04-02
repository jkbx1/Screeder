"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface MuxPlayerWrapperProps {
  playbackId: string;
  title?: string;
  token?: string;
}

export default function MuxPlayerWrapper({
  playbackId,
  title,
  token,
}: MuxPlayerWrapperProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!playerRef.current) return;
    
    // Check if the underlying native media element is paused
    const mediaEl = playerRef.current;
    if (mediaEl.paused) {
      const playPromise = mediaEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((error: Error) => {
          if (error.name !== "AbortError") console.error("Playback error:", error);
        });
      }
      setIsPlaying(true);
    } else {
      mediaEl.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative w-full aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/8 shadow-inner flex flex-col group/video z-0">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        tokens={
          token
            ? {
                playback: token,
                thumbnail: token,
                storyboard: token,
              }
            : undefined
        }
        metadata={{
          video_title: title || "Screen Recording",
        }}
        streamType="on-demand"
        autoPlay={false}
        className="w-full h-full object-contain cursor-pointer"
        style={{ '--controls': 'none' } as any}
        onTimeUpdate={(e) => {
          const el = e.target as HTMLVideoElement;
          setCurrentTime(el.currentTime || 0);
        }}
        onLoadedMetadata={(e) => {
           const el = e.target as HTMLVideoElement;
           setDuration(el.duration || 0);
        }}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Custom Controls Pill */}
      <div className="absolute inset-x-0 -bottom-20 group-hover/video:bottom-6 flex items-center justify-center gap-4 px-4 transition-all duration-300 ease-out opacity-0 group-hover/video:opacity-100 z-20 pointer-events-none">
        
        {/* Play/Pause Circle */}
        <button 
          onClick={togglePlay} 
          className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl drop-shadow-md text-foreground hover:bg-white/20 hover:scale-105 transition-all pointer-events-auto"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>
        
        {/* Seek Bar Pill */}
        <div className="flex items-center gap-4 px-6 py-3 h-12 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl pointer-events-auto">
          <div className="text-sm font-semibold text-foreground min-w-[4rem] text-center drop-shadow-md">
            {formatTime(currentTime)} <span className="text-muted-foreground font-normal">/ {formatTime(duration)}</span>
          </div>
          
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              if (playerRef.current) {
                playerRef.current.currentTime = Number(e.target.value);
                setCurrentTime(Number(e.target.value));
              }
            }}
            className="w-32 sm:w-48 lg:w-64 accent-primary cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full shadow-inner"
            aria-label="Seek video"
          />
        </div>
      </div>
    </div>
  );
}
