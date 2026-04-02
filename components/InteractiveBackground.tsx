"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const easedMousePos = useRef({ x: 0, y: 0 });
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number, h: number;
    const setCanvasSize = () => {
      w = canvas.width = window.innerWidth * window.devicePixelRatio;
      h = canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const animate = () => {
      // Smoothly ease the mouse position towards the actual mouse position
      easedMousePos.current.x += (mousePos.current.x - easedMousePos.current.x) * 0.1;
      easedMousePos.current.y += (mousePos.current.y - easedMousePos.current.y) * 0.1;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const spacing = 40;
      const influenceRadius = 300;

      for (let x = spacing / 2; x < window.innerWidth + spacing; x += spacing) {
        for (let y = spacing / 2; y < window.innerHeight + spacing; y += spacing) {
          const dx = x - easedMousePos.current.x;
          const dy = y - easedMousePos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let opacity = 0.06;

          if (dist < influenceRadius) {
            const factor = 1 - dist / influenceRadius;
            opacity = 0.06 + factor * 0.35; 
          }

          const isLight = resolvedTheme === 'light';
          // Use Coffee Bean 600 for light mode, Almond Silk 500 for dark mode
          ctx.strokeStyle = isLight 
            ? `rgba(117, 87, 102, ${opacity})` 
            : `rgba(170, 98, 85, ${opacity})`;
            
          ctx.lineWidth = 1;
          
          ctx.beginPath();
          // Connect segments to form a continuous grid
          ctx.moveTo(x - spacing / 2, y);
          ctx.lineTo(x + spacing / 2, y);
          ctx.moveTo(x, y - spacing / 2);
          ctx.lineTo(x, y + spacing / 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] select-none bg-background transition-colors duration-500" aria-hidden="true">
      {/* Interactive Dot Grid */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
        style={{ width: '100vw', height: '100vh' }}
      />
      
      {/* Global Vignette/Smoothing */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent,var(--color-background))] pointer-events-none" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
