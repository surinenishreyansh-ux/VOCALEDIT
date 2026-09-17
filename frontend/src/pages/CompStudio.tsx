import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Sliders, Volume2, Sparkles, Download, Music2, Eye, EyeOff, Check, ArrowUpDown } from 'lucide-react';
import { Project, Segment, Take } from '../types';
import { WaveformCanvas } from '../components/WaveformCanvas';
import { SegmentBlock } from '../components/SegmentBlock';
import { SegmentInspector } from '../components/SegmentInspector';
import { replaceSegmentTake } from '../services/api';

interface CompStudioProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onOpenExport: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackMode: 'comp' | 'original';
}

export const CompStudio: React.FC<CompStudioProps> = ({
  project,
  onUpdateProject,
  onOpenExport,
  currentTime,
  onSeek,
  isPlaying,
  onTogglePlay,
  playbackMode
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    project.segments?.[0]?.id || null
  );
  const [isReplacing, setIsReplacing] = useState(false);
  const [mutedTakes, setMutedTakes] = useState<Set<string>>(new Set());
  const [soloTakeId, setSoloTakeId] = useState<string | null>(null);

  const timelineRef = useRef<HTMLDivElement | null>(null);

  const totalDuration = project.comp?.duration || project.takes[0]?.duration || 20;

  // Selected segment object
  const selectedSegment = project.segments.find(s => s.id === selectedSegmentId) || project.segments[0] || null;

  // Active segment at current playhead
  const activeSegment = project.segments.find(
    s => currentTime >= s.start && currentTime < s.end
  ) || null;

  const handleSegmentClick = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
  };

  const handleReplaceTake = async (segmentId: string, newTakeId: string) => {
    setIsReplacing(true);
    try {
      const res = await replaceSegmentTake(project.id, segmentId, newTakeId);
      onUpdateProject({
        comp: res.comp,
        segments: res.segments
      });
    } catch (err) {
      console.error('Failed to replace take:', err);
    } finally {
      setIsReplacing(false);
    }
  };

  // Timeline click to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * totalDuration);
  };

  // Time format
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Generate ruler markers
  const numMarkers = Math.max(5, Math.ceil(totalDuration / 4));
  const markers = Array.from({ length: numMarkers }).map((_, i) => {
    const t = (i / (numMarkers - 1)) * totalDuration;
    return { time: t, label: fmt(t) };
  });

  const playheadPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="h-[calc(100vh-135px)] flex flex-col overflow-hidden px-6 py-4">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-studio-border/70 mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-studio-accent animate-pulse" />
          <h2 className="text-base font-bold text-white font-sans tracking-tight">
            Timeline Multi-Track Comping
          </h2>
          <span className="text-xs font-mono text-studio-textMuted px-2 py-0.5 rounded bg-studio-card border border-studio-border">
            {project.takes.length} Takes · {project.segments.length} AI Phrases
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Play/Pause */}
          <button
            onClick={onTogglePlay}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-studio-accent text-black shadow-glow-accent'
                : 'bg-studio-card hover:bg-studio-cardHover text-white border border-studio-border'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>

          {/* Export button */}
          <button
            onClick={onOpenExport}
            className="px-3.5 py-1.5 rounded-lg bg-studio-accent text-black hover:bg-studio-accentHover text-xs font-bold font-sans flex items-center gap-1.5 shadow-glow-accent transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Export Comp
          </button>
        </div>
      </div>

      {/* Main Studio Body: Timeline on Left, Inspector on Right */}
      <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">
        {/* LEFT: Timeline Container */}
        <div className="flex-1 glass-panel rounded-xl border border-studio-border flex flex-col min-h-0 overflow-hidden shadow-studio">
          {/* Timeline Header Ruler */}
          <div className="h-9 bg-studio-card border-b border-studio-border flex items-center pl-48 pr-4 select-none shrink-0">
            <div className="relative w-full h-full flex items-center">
              {markers.map((m, idx) => {
                const leftPct = (m.time / totalDuration) * 100;
                return (
                  <div
                    key={idx}
                    style={{ left: `${leftPct}%` }}
                    className="absolute -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  >
                    <span className="text-[10px] font-mono text-studio-textMuted font-medium">
                      {m.label}
                    </span>
                    <div className="w-[1px] h-2 bg-studio-borderLight mt-0.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stacked Tracks Scroll Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col divide-y divide-studio-border/50">
            {/* Playhead Guide Line spanning all tracks */}
            <div
              style={{ left: `calc(12rem + (100% - 12rem) * ${playheadPercent / 100})` }}
              className="absolute top-0 bottom-0 w-[2px] bg-studio-accent shadow-glow-accent z-30 pointer-events-none transition-all duration-75"
            >
              <div className="w-3 h-3 bg-studio-accent rounded-sm rotate-45 -translate-x-1 -translate-y-1.5 shadow-sm" />
            </div>

            {/* TAKE TRACKS (Take 01 through Take 10) */}
            {project.takes.map((take) => {
              const isSolo = soloTakeId === take.id;
              const isMuted = mutedTakes.has(take.id) || (soloTakeId !== null && !isSolo);

              // Check if take is used in any segment
              const segmentsUsedIn = project.segments.filter(s => s.selected_take_id === take.id);

              return (
                <div
                  key={take.id}
                  className={`h-14 flex items-center shrink-0 transition-colors group ${
                    isMuted ? 'opacity-40 bg-studio-bg/60' : 'hover:bg-studio-card/30'
                  }`}
                >
                  {/* Track Control Header (12rem width) */}
                  <div className="w-48 h-full bg-studio-card/80 border-r border-studio-border/80 px-3 py-1.5 flex items-center justify-between shrink-0 select-none">
                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-mono font-bold text-white">
                          {take.filename}
                        </span>
                        {segmentsUsedIn.length > 0 && (
                          <span
                            className="w-2 h-2 rounded-full bg-studio-accent"
                            title={`Used in ${segmentsUsedIn.length} comp segments`}
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-studio-textMuted">
                        {fmt(take.duration)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setSoloTakeId(isSolo ? null : take.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                          isSolo
                            ? 'bg-studio-accent text-black'
                            : 'bg-studio-surface text-studio-textMuted hover:text-white'
                        }`}
                        title="Solo Track"
                      >
                        S
                      </button>
                      <button
                        onClick={() => {
                          const updated = new Set(mutedTakes);
                          if (updated.has(take.id)) updated.delete(take.id);
                          else updated.add(take.id);
                          setMutedTakes(updated);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                          mutedTakes.has(take.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-studio-surface text-studio-textMuted hover:text-white'
                        }`}
                        title="Mute Track"
                      >
                        M
                      </button>
                    </div>
                  </div>

                  {/* Waveform Lane */}
                  <div
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                    className="flex-1 h-full px-4 flex items-center cursor-pointer relative timeline-grid"
                  >
                    <WaveformCanvas
                      waveform={take.waveform}
                      duration={totalDuration}
                      currentTime={currentTime}
                      height={34}
                      colorScheme={segmentsUsedIn.length > 0 ? 'cyan' : 'neutral'}
                      interactive={false}
                    />
                  </div>
                </div>
              );
            })}

            {/* MASTER INITIAL COMP TRACK (Centerpiece Track) */}
            <div className="h-24 bg-[#0F121A] border-t-2 border-studio-accent/40 flex items-center shrink-0 z-20 shadow-lg">
              {/* Comp Track Control Header */}
              <div className="w-48 h-full bg-[#121622] border-r border-studio-accent/40 px-3 py-2 flex flex-col justify-between shrink-0 select-none">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-studio-accent animate-pulse" />
                    <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
                      INITIAL COMP
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-studio-accent block mt-0.5">
                    AI Master Selection
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-studio-textMuted">
                  <span>Crossfaded</span>
                  <span className="text-emerald-400 font-semibold">Active</span>
                </div>
              </div>

              {/* Segment Blocks Overlay Lane */}
              <div
                onClick={handleTimelineClick}
                className="flex-1 h-full flex items-center cursor-pointer relative timeline-grid overflow-hidden"
              >
                {/* Visual Segments Block Container */}
                <div className="w-full h-full flex">
                  {project.segments.map((seg) => {
                    const isSel = seg.id === selectedSegmentId;
                    const isAct = activeSegment?.id === seg.id;
                    const takeObj = project.takes.find(t => t.id === seg.selected_take_id);

                    return (
                      <SegmentBlock
                        key={seg.id}
                        segment={seg}
                        isSelected={isSel}
                        isActive={isAct}
                        onClick={() => handleSegmentClick(seg.id)}
                        takeLabel={takeObj ? `TK ${String(takeObj.take_number).padStart(2, '0')}` : undefined}
                        totalDuration={totalDuration}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Segment Inspector Drawer */}
        <div className="w-80 shrink-0 h-full min-h-0">
          <SegmentInspector
            segment={selectedSegment}
            takes={project.takes}
            onReplaceTake={handleReplaceTake}
            isReplacing={isReplacing}
          />
        </div>
      </div>
    </div>
  );
};
