import React, { useRef, useEffect } from 'react';

interface WaveformCanvasProps {
  waveform: number[];
  duration: number;
  currentTime?: number;
  activeSegment?: { start: number; end: number };
  height?: number;
  colorScheme?: 'amber' | 'cyan' | 'neutral' | 'gradient';
  interactive?: boolean;
  onSeek?: (time: number) => void;
  className?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  waveform = [],
  duration = 1,
  currentTime = 0,
  activeSegment,
  height = 56,
  colorScheme = 'cyan',
  interactive = true,
  onSeek,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 400;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    if (!waveform || waveform.length === 0) {
      // Draw subtle flat center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      return;
    }

    const numPoints = waveform.length;
    const barWidth = Math.max(1.5, w / numPoints - 1);
    const step = w / numPoints;
    const centerY = h / 2;

    // Draw active segment background highlight if present
    if (activeSegment && duration > 0) {
      const segStartX = (activeSegment.start / duration) * w;
      const segEndX = (activeSegment.end / duration) * w;
      const segW = Math.max(2, segEndX - segStartX);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.fillRect(segStartX, 0, segW, h);

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(segStartX, 0, segW, h);
    }

    // Determine colors
    let baseColor = 'rgba(148, 163, 184, 0.45)';
    let activeColor = '#38BDF8';
    if (colorScheme === 'amber') {
      baseColor = 'rgba(245, 158, 11, 0.45)';
      activeColor = '#F59E0B';
    } else if (colorScheme === 'neutral') {
      baseColor = 'rgba(148, 163, 184, 0.35)';
      activeColor = '#E2E8F0';
    }

    // Playhead position
    const playheadX = duration > 0 ? (currentTime / duration) * w : 0;

    for (let i = 0; i < numPoints; i++) {
      const x = i * step;
      const amp = Math.max(0.08, Math.min(1.0, waveform[i]));
      const barHeight = Math.max(3, amp * (h * 0.82));

      const isPlayed = x <= playheadX;
      let inActiveSeg = false;
      if (activeSegment && duration > 0) {
        const t = (i / numPoints) * duration;
        inActiveSeg = t >= activeSegment.start && t <= activeSegment.end;
      }

      if (inActiveSeg) {
        ctx.fillStyle = isPlayed ? '#F59E0B' : 'rgba(245, 158, 11, 0.65)';
      } else if (isPlayed) {
        ctx.fillStyle = activeColor;
      } else {
        ctx.fillStyle = baseColor;
      }

      // Rounded vertical mirrored bar
      const topY = centerY - barHeight / 2;
      ctx.fillRect(x, topY, barWidth, barHeight);
    }

    // Draw playhead vertical line
    if (currentTime > 0 && currentTime <= duration) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();

      // Small playhead triangle handle
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(playheadX - 3.5, 0);
      ctx.lineTo(playheadX + 3.5, 0);
      ctx.lineTo(playheadX, 5);
      ctx.closePath();
      ctx.fill();
    }
  }, [waveform, duration, currentTime, activeSegment, height, colorScheme]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onSeek || !canvasRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ height: `${height}px` }}
      onClick={handleClick}
      className={`w-full block ${interactive ? 'cursor-pointer' : ''} ${className}`}
    />
  );
};
