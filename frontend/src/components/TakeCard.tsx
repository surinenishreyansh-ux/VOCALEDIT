import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Volume2, Music, CheckCircle2 } from 'lucide-react';
import { Take } from '../types';
import { WaveformCanvas } from './WaveformCanvas';

interface TakeCardProps {
  take: Take;
  onDelete?: (takeId: string) => void;
  isCompact?: boolean;
}

export const TakeCard: React.FC<TakeCardProps> = ({
  take,
  onDelete,
  isCompact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause any other active audio
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audioRef.current) el.pause();
      });
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card rounded-xl p-4 border border-studio-border hover:border-studio-borderLight transition-all group">
      <audio ref={audioRef} src={take.file_url} preload="metadata" />

      <div className="flex items-center justify-between gap-4">
        {/* Left: Take Number and File Info */}
        <div className="flex items-center space-x-3 min-w-[170px]">
          <div className="w-8 h-8 rounded-lg bg-studio-card flex items-center justify-center border border-studio-border font-mono text-xs font-semibold text-studio-textSecondary group-hover:text-studio-cyan group-hover:border-studio-cyan/40 transition-colors">
            {String(take.take_number).padStart(2, '0')}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-white truncate font-sans group-hover:text-studio-textPrimary" title={take.filename}>
              {take.filename}
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-studio-textMuted mt-0.5">
              <span>{formatTime(take.duration)}</span>
              {take.offset_sec !== undefined && (
                <span className="text-studio-cyan font-mono text-[10px]">
                  {take.offset_sec >= 0 ? `+${take.offset_sec}s` : `${take.offset_sec}s`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Waveform preview */}
        <div className="flex-1 max-w-2xl px-2">
          <WaveformCanvas
            waveform={take.waveform}
            duration={take.duration}
            currentTime={currentTime}
            height={isCompact ? 36 : 44}
            colorScheme={isPlaying ? 'cyan' : 'neutral'}
            onSeek={handleSeek}
          />
        </div>

        {/* Right Controls: Play / Remove */}
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-studio-cyan text-black shadow-glow-cyan'
                : 'bg-studio-card hover:bg-studio-cardHover text-white border border-studio-border'
            }`}
            title={isPlaying ? 'Pause' : 'Play Take'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(take.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-studio-textMuted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Remove Take"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
