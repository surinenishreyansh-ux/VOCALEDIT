import React, { useState } from 'react';
import { X, Download, FileAudio, Check, Sparkles } from 'lucide-react';
import { getExportUrl } from '../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName
}) => {
  const [format, setFormat] = useState<'wav' | 'mp3'>('wav');
  const [bitDepth, setBitDepth] = useState<24 | 16>(24);
  const [filename, setFilename] = useState(() => {
    const clean = projectName.trim().replace(/\s+/g, '_');
    return clean || 'Initial_Vocal_Comp';
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    const url = getExportUrl(projectId, format, bitDepth);

    // Trigger download in browser
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-studio-border p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-studio-textMuted hover:text-white hover:bg-studio-card transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-studio-accent/20 border border-studio-accent/40 flex items-center justify-center text-studio-accent">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              Export Initial Comp
            </h3>
            <p className="text-xs text-studio-textMuted mt-0.5">
              Lossless stitched audio rendered with raised-cosine crossfades
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Filename Input */}
          <div>
            <label className="block text-xs font-mono text-studio-textSecondary uppercase tracking-wider mb-2">
              File Name
            </label>
            <div className="flex items-center rounded-lg bg-studio-card border border-studio-border px-3 py-2 focus-within:border-studio-accent/60">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full bg-transparent text-sm text-white font-mono focus:outline-none"
                placeholder="Initial_Vocal_Comp"
              />
              <span className="text-xs font-mono text-studio-textMuted">
                .{format}
              </span>
            </div>
          </div>

          {/* Audio Format Selector */}
          <div>
            <label className="block text-xs font-mono text-studio-textSecondary uppercase tracking-wider mb-2">
              Audio Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('wav')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  format === 'wav'
                    ? 'bg-studio-accent/15 border-studio-accent text-white shadow-glow-accent'
                    : 'bg-studio-card border-studio-border text-studio-textSecondary hover:border-studio-borderLight'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">WAV</span>
                  {format === 'wav' && <Check className="w-4 h-4 text-studio-accent" />}
                </div>
                <div className="text-[11px] text-studio-textMuted">
                  Uncompressed studio master (PCM)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('mp3')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  format === 'mp3'
                    ? 'bg-studio-accent/15 border-studio-accent text-white shadow-glow-accent'
                    : 'bg-studio-card border-studio-border text-studio-textSecondary hover:border-studio-borderLight'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">MP3</span>
                  {format === 'mp3' && <Check className="w-4 h-4 text-studio-accent" />}
                </div>
                <div className="text-[11px] text-studio-textMuted">
                  320 kbps high bitrate broadcast
                </div>
              </button>
            </div>
          </div>

          {/* Bit Depth Selector for WAV */}
          {format === 'wav' && (
            <div>
              <label className="block text-xs font-mono text-studio-textSecondary uppercase tracking-wider mb-2">
                Bit Depth
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBitDepth(24)}
                  className={`p-2.5 rounded-lg border text-center font-mono text-xs font-medium transition-all ${
                    bitDepth === 24
                      ? 'bg-studio-surface border-studio-accent text-studio-accent'
                      : 'bg-studio-card border-studio-border text-studio-textMuted hover:text-white'
                  }`}
                >
                  24-bit (Studio Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setBitDepth(16)}
                  className={`p-2.5 rounded-lg border text-center font-mono text-xs font-medium transition-all ${
                    bitDepth === 16
                      ? 'bg-studio-surface border-studio-accent text-studio-accent'
                      : 'bg-studio-card border-studio-border text-studio-textMuted hover:text-white'
                  }`}
                >
                  16-bit (CD Standard)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-studio-textSecondary hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-black font-semibold text-xs flex items-center gap-2 shadow-glow-accent transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Rendering Output...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Comp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
