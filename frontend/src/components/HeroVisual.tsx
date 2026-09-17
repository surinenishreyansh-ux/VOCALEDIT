import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

export const HeroVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredTake, setHoveredTake] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.025;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const numTakes = 10;
      const startX = 140;
      const convergeX = width * 0.58;
      const endX = width - 40;
      const centerY = height / 2;

      // Draw each take channel converging to center
      for (let i = 0; i < numTakes; i++) {
        // Distribute 10 take heights evenly across canvas
        const takeY = 40 + i * ((height - 80) / (numTakes - 1));
        const isHovered = hoveredTake === i;
        const isTopHalf = i < 5;

        // Subtle oscillating wave data for each take
        ctx.beginPath();
        ctx.moveTo(startX, takeY);

        // Horizontal line with micro-waveform bumps before convergence
        const segPoints = 30;
        for (let s = 0; s <= segPoints; s++) {
          const x = startX + (s / segPoints) * (convergeX - startX);
          // Waveform vibration
          const freq = 0.15 + (i % 3) * 0.05;
          const amp = isHovered ? 4.5 : 2.5;
          const yOffset = Math.sin(x * freq + time * (1.5 + (i % 4) * 0.2)) * amp;
          ctx.lineTo(x, takeY + yOffset);
        }

        // Curved convergence path into center FINAL COMP line
        const cp1x = convergeX + (width * 0.08);
        const cp1y = takeY;
        const cp2x = convergeX + (width * 0.14);
        const cp2y = centerY;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, convergeX + (width * 0.2), centerY);

        // Styling for take streams
        const isStarTake = (i === 3 || i === 6 || i === 1); // e.g. Take 04, Take 07, Take 02
        ctx.lineWidth = isHovered ? 2.5 : (isStarTake ? 1.6 : 1.1);
        ctx.strokeStyle = isHovered
          ? '#F59E0B'
          : (isStarTake ? 'rgba(56, 189, 248, 0.45)' : 'rgba(148, 163, 184, 0.18)');
        ctx.stroke();

        // Moving energy pulse packet along the stream
        const packetProgress = (time * 0.3 + (i * 0.1)) % 1.0;
        let px = 0;
        let py = 0;
        if (packetProgress < 0.65) {
          // Along horizontal section
          const t = packetProgress / 0.65;
          px = startX + t * (convergeX - startX);
          py = takeY;
        } else {
          // Along curve
          const t = (packetProgress - 0.65) / 0.35;
          const u = 1 - t;
          px = u * u * u * convergeX + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * (convergeX + width * 0.2);
          py = u * u * u * takeY + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * centerY;
        }

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(px, py, isHovered ? 3.5 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#F59E0B' : (isTopHalf ? '#38BDF8' : '#F59E0B');
        ctx.shadowColor = isHovered ? '#F59E0B' : '#38BDF8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw the unified FINAL COMP track on the right
      const compStartX = convergeX + (width * 0.18);
      ctx.beginPath();
      ctx.moveTo(compStartX, centerY);

      // Rich composite waveform for Final Comp
      const compSteps = 60;
      for (let c = 0; c <= compSteps; c++) {
        const x = compStartX + (c / compSteps) * (endX - compStartX);
        const compositeAmp = 12 * Math.sin(x * 0.08 + time * 3.0) * Math.cos(x * 0.03 - time);
        ctx.lineTo(x, centerY + compositeAmp);
      }

      // Outer glow for Final Comp
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner bright core
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hoveredTake]);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl bg-studio-surface/80 border border-studio-border/70 p-6 shadow-2xl backdrop-blur-md overflow-hidden group">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-radial from-studio-cardHover/40 via-transparent to-transparent pointer-events-none" />

      {/* Top Bar Header inside card */}
      <div className="flex items-center justify-between border-b border-studio-border/50 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-studio-accent animate-pulse" />
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-studio-textSecondary">
            Multi-Take Convergence Engine
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono text-studio-textMuted">
          <span>10 Inputs</span>
          <span>→</span>
          <span className="text-studio-accent font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            1 Initial Comp
          </span>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative w-full h-[380px] flex">
        {/* Left Take labels */}
        <div className="w-28 flex flex-col justify-between py-2 z-10 select-none">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredTake(idx)}
              onMouseLeave={() => setHoveredTake(null)}
              className={`text-[11px] font-mono transition-all cursor-pointer flex items-center gap-2 ${
                hoveredTake === idx
                  ? 'text-studio-accent translate-x-1 font-semibold'
                  : 'text-studio-textMuted hover:text-studio-textSecondary'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-studio-borderLight" />
              TAKE {String(idx + 1).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Canvas Engine */}
        <canvas
          ref={canvasRef}
          width={900}
          height={380}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Right Final Comp Banner */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="px-3.5 py-2 rounded-lg bg-studio-card/90 border border-studio-accent/40 shadow-glow-accent text-right backdrop-blur-md">
            <div className="text-[10px] uppercase font-mono tracking-widest text-studio-accent font-bold">
              AI Output
            </div>
            <div className="text-sm font-bold text-white font-sans">
              Initial Comp
            </div>
            <div className="text-[10px] text-studio-textSecondary font-mono mt-0.5">
              Stitched & Crossfaded
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status line */}
      <div className="mt-4 pt-3 border-t border-studio-border/40 flex items-center justify-between text-xs text-studio-textMuted">
        <span className="font-mono text-[11px]">
          Correlation alignment · 2–5s adaptive phrases · Metric-weighted selection
        </span>
        <span className="text-[11px] text-studio-cyan font-mono">
          Non-destructive · Producer in control
        </span>
      </div>
    </div>
  );
};
