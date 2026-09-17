import React from 'react';
import { Segment } from '../types';

interface SegmentBlockProps {
  segment: Segment;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
  takeLabel?: string;
  totalDuration: number;
}

export const SegmentBlock: React.FC<SegmentBlockProps> = ({
  segment,
  isSelected,
  isActive,
  onClick,
  takeLabel,
  totalDuration
}) => {
  const widthPercent = totalDuration > 0 ? (segment.duration / totalDuration) * 100 : 20;

  // Format time (e.g. 00:04)
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const label = takeLabel || segment.selected_take_id.replace('take_', 'TAKE ');

  return (
    <div
      onClick={onClick}
      style={{ width: `${widthPercent}%` }}
      className={`relative h-20 border-r border-studio-border/70 p-2.5 flex flex-col justify-between cursor-pointer transition-all select-none overflow-hidden ${
        isSelected
          ? 'bg-studio-accent/20 border-t-2 border-t-studio-accent shadow-glow-accent'
          : isActive
          ? 'bg-studio-cyan/15 border-t-2 border-t-studio-cyan'
          : 'bg-studio-card/80 hover:bg-studio-cardHover'
      }`}
    >
      {/* Active pulse aura */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none" />
      )}

      {/* Top: Take Label and Score Badge */}
      <div className="flex items-center justify-between gap-1 z-10">
        <span className={`text-[11px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
          isSelected
            ? 'bg-studio-accent text-black font-semibold'
            : 'bg-studio-surface/80 text-white border border-studio-border'
        }`}>
          {label}
        </span>
        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
          segment.score >= 90
            ? 'text-emerald-400 bg-emerald-500/15'
            : segment.score >= 80
            ? 'text-studio-cyan bg-studio-cyan/15'
            : 'text-studio-textSecondary bg-studio-surface'
        }`}>
          {segment.score}
        </span>
      </div>

      {/* Bottom: Time range */}
      <div className="flex items-center justify-between text-[10px] font-mono text-studio-textMuted z-10">
        <span>{fmt(segment.start)}</span>
        <span>{fmt(segment.end)}</span>
      </div>
    </div>
  );
};
