"use client";

import { useState } from "react";
import Image from "next/image";

interface VideoThumbnailProps {
  playbackId: string;
  alt?: string;
  token?: string;
}

export default function VideoThumbnail({
  playbackId,
  alt,
  token,
}: VideoThumbnailProps) {
  const [isError, setIsError] = useState(false);
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?time=1${token ? `&token=${token}` : ""}`;

  return (
    <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center overflow-hidden">
      {!isError ? (
        <Image
          src={thumbnailUrl}
          alt={alt || "Video thumbnail"}
          fill
          className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          onError={() => setIsError(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-800" />
        </div>
      )}
    </div>
  );
}
