import React, { useState, useRef } from 'react';
import { UploadCloud, Music, Sparkles, ArrowRight, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';
import { Project, Take } from '../types';
import { TakeCard } from '../components/TakeCard';
import { uploadTakes, deleteTake, loadDemoTakes } from '../services/api';

interface CreateProjectProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onStartAnalysis: () => void;
}

export const CreateProject: React.FC<CreateProjectProps> = ({
  project,
  onUpdateProject,
  onStartAnalysis
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const takesCount = project.takes.length;
  const canAnalyze = takesCount >= 2 && takesCount <= 10;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const fileList = Array.from(files);
    if (takesCount + fileList.length > 10) {
      setUploadError('VocalEditor supports up to 10 takes in this version.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadTakes(project.id, fileList);
      onUpdateProject({ takes: res.takes });
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading takes. Ensure files are WAV, MP3, M4A, or FLAC.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDemo = async () => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const res = await loadDemoTakes(project.id);
      onUpdateProject({ takes: res.takes });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load demo takes.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteTake = async (takeId: string) => {
    try {
      await deleteTake(project.id, takeId);
      const updatedTakes = project.takes.filter(t => t.id !== takeId);
      // Re-index
      const reindexed = updatedTakes.map((t, i) => ({ ...t, take_number: i + 1 }));
      onUpdateProject({ takes: reindexed });
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-24">
      {/* Title & Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white font-sans">
          New Vocal Comp
        </h2>
        <p className="text-sm text-studio-textSecondary mt-1">
          Configure project details and import between 2 to 10 recorded vocal takes.
        </p>
      </div>

      {/* Project Configuration Card */}
      <div className="glass-card rounded-2xl p-6 border border-studio-border mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Project Name */}
          <div className="md:col-span-1">
            <label className="block text-xs font-mono text-studio-textSecondary uppercase tracking-wider mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => onUpdateProject({ name: e.target.value })}
              placeholder="Untitled Vocal Comp"
              className="w-full rounded-lg bg-studio-surface border border-studio-border px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-accent/70 font-medium"
            />
          </div>

          {/* BPM (Optional) */}
          <div>
            <label className="block text-xs font-mono text-studio-textSecondary uppercase tracking-wider mb-2">
              BPM <span className="text-[10px] text-studio-textMuted lowercase">(optional)</span>
            </label>
            <input
              type="number"
              value={project.bpm || 120}
              onChange={(e) => onUpdateProject({ bpm: parseInt(e.target.value) || 120 })}
              className="w-full rounded-lg bg-studio-surface border border-studio-border px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-studio-accent/70"
            />
          </div>

          {/* Key (Optional) */}
          <div>
            <label className="block text-xs font-mono text-studio-textSecondary uppercase tracking-wider mb-2">
              Key <span className="text-[10px] text-studio-textMuted lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={project.key || 'C Major'}
              onChange={(e) => onUpdateProject({ key: e.target.value })}
              className="w-full rounded-lg bg-studio-surface border border-studio-border px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-studio-accent/70"
            />
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">
            Upload Your Takes
          </h3>
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-lg bg-studio-card hover:bg-studio-cardHover text-studio-accent border border-studio-border text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Load 10 Demo Takes (1-Click)
          </button>
        </div>

        {/* Drag and Drop Container */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-studio-accent bg-studio-accent/5'
              : 'border-studio-border hover:border-studio-borderLight bg-studio-card/40 hover:bg-studio-card/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".wav,.mp3,.m4a,.flac"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-studio-card border border-studio-border flex items-center justify-center text-studio-textSecondary mx-auto mb-4 group-hover:text-white">
            <UploadCloud className="w-6 h-6 text-studio-cyan" />
          </div>

          <h4 className="text-base font-semibold text-white">
            Drop your vocal takes here
          </h4>
          <p className="text-xs text-studio-textMuted mt-1 font-mono">
            WAV, MP3, M4A, FLAC · 2–10 takes
          </p>

          <button
            type="button"
            className="mt-5 px-5 py-2 rounded-lg bg-studio-card border border-studio-borderLight text-xs font-semibold text-white hover:bg-studio-cardHover transition-colors inline-flex items-center gap-2"
          >
            Browse Files
          </button>
        </div>

        {/* Error Notification */}
        {uploadError && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Uploaded Takes List */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">
              Uploaded Takes
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-studio-card border border-studio-border text-studio-textSecondary">
              {takesCount} / 10 takes
            </span>
          </div>
          {takesCount > 0 && (
            <span className="text-xs font-mono text-studio-textMuted">
              {takesCount < 2 ? 'Need at least 2 takes to analyze' : 'Ready to analyze'}
            </span>
          )}
        </div>

        {takesCount === 0 ? (
          <div className="p-8 rounded-xl border border-studio-border/60 bg-studio-card/20 text-center">
            <Music className="w-8 h-8 text-studio-textMuted/40 mx-auto mb-2" />
            <h5 className="text-sm font-semibold text-studio-textSecondary">
              Start with the performances.
            </h5>
            <p className="text-xs text-studio-textMuted mt-1">
              Upload 2–10 vocal takes and VocalEditor will build your initial comp.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.takes.map((take) => (
              <TakeCard
                key={take.id}
                take={take}
                onDelete={handleDeleteTake}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analyze CTA Bottom Bar */}
      <div className="flex items-center justify-between border-t border-studio-border pt-6">
        <div className="text-xs text-studio-textMuted font-mono">
          {takesCount >= 2 && takesCount <= 10 ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-4 h-4" />
              Ready for alignment & quality scoring
            </span>
          ) : (
            <span>Upload 2 to 10 takes to activate analysis</span>
          )}
        </div>

        <button
          onClick={onStartAnalysis}
          disabled={!canAnalyze || isUploading}
          className={`px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            canAnalyze && !isUploading
              ? 'bg-studio-accent hover:bg-studio-accentHover text-black shadow-glow-accent active:scale-95'
              : 'bg-studio-card border border-studio-border text-studio-textMuted cursor-not-allowed opacity-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Analyze Takes
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
