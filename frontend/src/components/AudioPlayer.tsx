import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Music2, SkipBack, SkipForward } from 'lucide-react';
import { CompData, Take } from '../types';
import { getAudioUrl } from '../services/api';

interface AudioPlayerProps {
  comp: CompData | null;
  referenceTake: Take | null;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackMode: 'comp' | 'original';
  onTogglePlaybackMode: (mode: 'comp' | 'original') => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  comp,
  referenceTake,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onTogglePlay,
  playbackMode,
  onTogglePlaybackMode
}) => {
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const rawUrl = playbackMode === 'comp'
    ? comp?.file_url
    : (referenceTake?.file_url || comp?.file_url);
  const activeAudioUrl = getAudioUrl(rawUrl);

  const duration = comp?.duration || referenceTake?.duration || 20;

  // Keep HTML5 audio synchronized
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // When switching between comp and original, preserve current playback position
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const currentPos = currentTime;
    audio.src = activeAudioUrl || '';
    audio.currentTime = currentPos;
    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [activeAudioUrl]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    onTimeUpdate(newTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-studio-border px-6 py-3 shadow-2xl backdrop-blur-xl">
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => onTogglePlay()}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Left: Track Information & Status Badge */}
        <div className="flex items-center space-x-4 min-w-[220px]">
          <div className="relative">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
              playbackMode === 'comp'
                ? 'bg-studio-accent/20 border-studio-accent shadow-glow-accent text-studio-accent'
                : 'bg-studio-card border-studio-border text-studio-cyan'
            }`}>
              {playbackMode === 'comp' ? (
                <Sparkles className="w-5 h-5 animate-pulse" />
              ) : (
                <Music2 className="w-5 h-5" />
              )}
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                playbackMode === 'comp'
                  ? 'bg-studio-accent text-black'
                  : 'bg-studio-surface text-studio-textSecondary border border-studio-border'
              }`}>
                {playbackMode === 'comp' ? 'AI INITIAL COMP' : 'ORIGINAL (REF)'}
              </span>
            </div>
            <div className="text-xs font-semibold text-white truncate mt-1">
              {playbackMode === 'comp' ? 'Unified Multi-Take Performance' : (referenceTake?.filename || 'Take 01 (Reference)')}
            </div>
          </div>
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex-1 max-w-2xl flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-1">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 5);
              }}
              className="p-1.5 text-studio-textMuted hover:text-white transition-colors"
              title="Back 5s"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                playbackMode === 'comp'
                  ? 'bg-studio-accent text-black hover:bg-studio-accentHover shadow-glow-accent'
                  : 'bg-studio-cyan text-black hover:bg-studio-cyan/90 shadow-glow-cyan'
              } active:scale-95`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 5);
              }}
              className="p-1.5 text-studio-textMuted hover:text-white transition-colors"
              title="Forward 5s"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber & Timecodes */}
          <div className="w-full flex items-center space-x-3">
            <span className="text-xs font-mono text-studio-textSecondary w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 group py-1">
              <input
                type="range"
                min={0}
                max={duration || 20}
                step={0.01}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-studio-card rounded-lg appearance-none cursor-pointer accent-studio-accent focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono text-studio-textMuted w-10 text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: A/B Before/After Switcher & Volume */}
        <div className="flex items-center space-x-5 min-w-[220px] justify-end">
          {/* A/B Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-studio-card border border-studio-border">
            <button
              onClick={() => onTogglePlaybackMode('original')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                playbackMode === 'original'
                  ? 'bg-studio-surface text-studio-cyan shadow-sm border border-studio-cyan/40'
                  : 'text-studio-textMuted hover:text-white'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => onTogglePlaybackMode('comp')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                playbackMode === 'comp'
                  ? 'bg-studio-accent text-black font-bold shadow-glow-accent'
                  : 'text-studio-textMuted hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              AI Comp
            </button>
          </div>

          {/* Master Volume */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-studio-textMuted hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 bg-studio-card rounded-lg appearance-none cursor-pointer accent-studio-textSecondary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
