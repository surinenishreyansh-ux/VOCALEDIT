import React, { useState, useRef } from 'react';
import { Check, Play, Pause, Sliders, Volume2, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { Segment, Take } from '../types';

interface SegmentInspectorProps {
  segment: Segment | null;
  takes: Take[];
  onReplaceTake: (segmentId: string, takeId: string) => Promise<void>;
  isReplacing?: boolean;
}

export const SegmentInspector: React.FC<SegmentInspectorProps> = ({
  segment,
  takes,
  onReplaceTake,
  isReplacing = false
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'override' | 'compare'>('details');
  const [auditioningTakeId, setAuditioningTakeId] = useState<string | null>(null);
  const auditionAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!segment) {
    return (
      <div className="glass-panel h-full rounded-xl border border-studio-border p-6 flex flex-col items-center justify-center text-center">
        <Sliders className="w-10 h-10 text-studio-textMuted/40 mb-3" />
        <h4 className="text-sm font-semibold text-studio-textSecondary">No Segment Selected</h4>
        <p className="text-xs text-studio-textMuted mt-1 max-w-[220px]">
          Click any segment block on the Initial Comp track to inspect AI metrics, audition candidate takes, or manually override.
        </p>
      </div>
    );
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const selectedTake = takes.find(t => t.id === segment.selected_take_id);
  const selectedTakeName = selectedTake?.filename || segment.selected_take_id.replace('take_', 'Take ');

  // Audition take for just this segment duration
  const handleAudition = (take: Take) => {
    if (auditioningTakeId === take.id) {
      if (auditionAudioRef.current) {
        auditionAudioRef.current.pause();
      }
      setAuditioningTakeId(null);
      return;
    }

    if (auditionAudioRef.current) {
      auditionAudioRef.current.pause();
    }

    const audio = new Audio(take.file_url);
    auditionAudioRef.current = audio;
    audio.currentTime = segment.start;
    setAuditioningTakeId(take.id);

    audio.play().catch(console.error);

    const checkEndTime = () => {
      if (audio.currentTime >= segment.end) {
        audio.pause();
        audio.removeEventListener('timeupdate', checkEndTime);
        setAuditioningTakeId(null);
      }
    };
    audio.addEventListener('timeupdate', checkEndTime);
    audio.addEventListener('ended', () => setAuditioningTakeId(null));
  };

  const metrics = segment.metrics || {
    pitch: 80, timing: 80, clarity: 80, noise: 80, energy: 80, overall: 80
  };

  return (
    <div className="glass-panel h-full rounded-xl border border-studio-border p-5 flex flex-col justify-between overflow-y-auto">
      <div>
        {/* Header: Segment Range and Title */}
        <div className="flex items-center justify-between border-b border-studio-border/60 pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-studio-textMuted">
              Segment {String(segment.index).padStart(2, '0')}
            </span>
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              {fmt(segment.start)} – {fmt(segment.end)}
              <span className="text-[11px] font-mono font-normal text-studio-textMuted">
                ({segment.duration}s)
              </span>
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-studio-accent font-semibold block">
              AI Score
            </span>
            <span className="text-2xl font-black font-mono text-white">
              {segment.score}
            </span>
          </div>
        </div>

        {/* Selected Take Banner */}
        <div className="p-3 rounded-lg bg-studio-card/80 border border-studio-border flex items-center justify-between mb-4">
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono text-studio-textMuted uppercase tracking-wider block">
              Selected Take
            </span>
            <span className="text-sm font-semibold text-white truncate block">
              {selectedTakeName}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-studio-accent/20 text-studio-accent border border-studio-accent/40 font-semibold">
            WINNER
          </span>
        </div>

        {/* Tab Navigation: Details vs Override vs Compare */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-studio-card border border-studio-border mb-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'details'
                ? 'bg-studio-surface text-white shadow-sm border border-studio-border'
                : 'text-studio-textMuted hover:text-white'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('override')}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'override'
                ? 'bg-studio-surface text-studio-accent shadow-sm border border-studio-border'
                : 'text-studio-textMuted hover:text-white'
            }`}
          >
            Change Take
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'compare'
                ? 'bg-studio-surface text-studio-cyan shadow-sm border border-studio-border'
                : 'text-studio-textMuted hover:text-white'
            }`}
          >
            Compare
          </button>
        </div>

        {/* TAB 1: METRICS & REASON */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Selection Reason Box */}
            <div className="p-3 rounded-lg bg-studio-cardHover/60 border border-studio-border/60">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-studio-accent font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Selection Reason
              </div>
              <p className="text-xs text-studio-textSecondary leading-relaxed">
                {segment.reason || 'Optimal alignment across pitch, timing, and vocal harmonic clarity.'}
              </p>
            </div>

            {/* Metrics Breakdown Bars */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-studio-textMuted uppercase tracking-wider block">
                Quality Analysis Breakdown
              </span>

              {[
                { label: 'Pitch Stability', weight: '30%', value: metrics.pitch, color: '#38BDF8' },
                { label: 'Timing Alignment', weight: '30%', value: metrics.timing, color: '#F59E0B' },
                { label: 'Vocal Clarity', weight: '20%', value: metrics.clarity, color: '#10B981' },
                { label: 'Noise Suppression', weight: '10%', value: metrics.noise, color: '#818CF8' },
                { label: 'Dynamic Energy', weight: '10%', value: metrics.energy, color: '#EC4899' },
              ].map((m, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-studio-textSecondary font-medium flex items-center gap-1.5">
                      {m.label}
                      <span className="text-[10px] text-studio-textMuted font-mono">({m.weight})</span>
                    </span>
                    <span className="font-mono font-bold text-white">{m.value}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-studio-card overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.value}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL OVERRIDE (CHANGE TAKE) */}
        {activeTab === 'override' && (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            <div className="text-[11px] text-studio-textMuted mb-2">
              Select another take for this phrase. VocalEditor will automatically re-crossfade and update the master comp.
            </div>

            {takes.map((take) => {
              const takeScoreObj = segment.take_scores?.[take.id];
              const score = takeScoreObj ? takeScoreObj.overall : 80;
              const isCurrent = take.id === segment.selected_take_id;

              return (
                <div
                  key={take.id}
                  onClick={() => !isCurrent && onReplaceTake(segment.id, take.id)}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-studio-accent/15 border-studio-accent/60 shadow-sm'
                      : 'bg-studio-card/80 border-studio-border hover:border-studio-borderLight hover:bg-studio-card'
                  } ${isReplacing ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded bg-studio-surface border border-studio-border flex items-center justify-center font-mono text-[10px] text-studio-textMuted">
                      {String(take.take_number).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white truncate max-w-[130px]">
                        {take.filename}
                      </div>
                      <div className="text-[10px] font-mono text-studio-textMuted">
                        Score: <span className="text-studio-textPrimary font-semibold">{score}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-studio-accent">
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    ) : (
                      <button
                        className="px-2 py-1 rounded bg-studio-surface hover:bg-studio-borderLight text-xs text-studio-textSecondary hover:text-white font-medium transition-colors"
                      >
                        Choose
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: COMPARE & AUDITION */}
        {activeTab === 'compare' && (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            <div className="text-[11px] text-studio-textMuted mb-2">
              Audition each take isolated for this specific phrase ({fmt(segment.start)}–{fmt(segment.end)}):
            </div>

            {takes.map((take) => {
              const isAuditioning = auditioningTakeId === take.id;
              const isCurrent = take.id === segment.selected_take_id;
              const score = segment.take_scores?.[take.id]?.overall ?? 80;

              return (
                <div
                  key={take.id}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    isAuditioning
                      ? 'bg-studio-cyan/20 border-studio-cyan shadow-glow-cyan'
                      : isCurrent
                      ? 'bg-studio-accent/10 border-studio-accent/40'
                      : 'bg-studio-card/70 border-studio-border'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleAudition(take)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isAuditioning
                          ? 'bg-studio-cyan text-black'
                          : 'bg-studio-surface hover:bg-studio-cardHover text-white border border-studio-border'
                      }`}
                      title={isAuditioning ? 'Pause Audition' : 'Audition Phrase'}
                    >
                      {isAuditioning ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-medium text-white truncate max-w-[130px]">
                        {take.filename}
                      </div>
                      <div className="text-[10px] font-mono text-studio-textMuted">
                        Score: <span className="font-semibold text-white">{score}</span>
                        {isCurrent && <span className="text-studio-accent ml-1.5">(Current)</span>}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => onReplaceTake(segment.id, take.id)}
                      disabled={isReplacing}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-studio-surface hover:bg-studio-cardHover text-studio-textSecondary hover:text-white border border-studio-border transition-colors"
                    >
                      Select Take
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-studio-border/50 text-[10px] font-mono text-studio-textMuted flex items-center justify-between">
        <span>Crossfade: 35ms Raised-Cosine</span>
        <span>Transparent Limiter</span>
      </div>
    </div>
  );
};
