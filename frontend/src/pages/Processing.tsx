import React, { useEffect, useState, useRef } from 'react';
import { Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getAnalysisStatus } from '../services/api';

interface ProcessingProps {
  projectId: string;
  onComplete: () => void;
  onError: (msg: string) => void;
}

const STAGES = [
  'Importing audio',
  'Normalizing recordings',
  'Detecting vocal regions',
  'Aligning performances',
  'Segmenting takes',
  'Comparing performances',
  'Building initial comp',
];

export const Processing: React.FC<ProcessingProps> = ({
  projectId,
  onComplete,
  onError
}) => {
  const [progress, setProgress] = useState(10);
  const [currentStage, setCurrentStage] = useState('Importing audio');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animated spectrum visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const draw = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const numBars = 48;
      const barW = (w / numBars) - 2;
      const centerY = h / 2;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barW + 2);
        // Multi-frequency wave oscillation
        const wave1 = Math.sin(i * 0.25 + t * 2.5);
        const wave2 = Math.cos(i * 0.15 - t * 1.8);
        const wave3 = Math.sin(i * 0.08 + t * 4.0);
        const amp = Math.abs(wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.25);
        const barH = Math.max(6, amp * (h * 0.8));

        // Amber to cyan gradient
        const grad = ctx.createLinearGradient(0, centerY - barH / 2, 0, centerY + barH / 2);
        grad.addColorStop(0, '#38BDF8');
        grad.addColorStop(0.5, '#F59E0B');
        grad.addColorStop(1, '#38BDF8');

        ctx.fillStyle = grad;
        ctx.fillRect(x, centerY - barH / 2, barW, barH);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Poll backend status
  useEffect(() => {
    let interval: any;
    let isCancelled = false;

    const checkStatus = async () => {
      try {
        const res = await getAnalysisStatus(projectId);
        if (isCancelled) return;

        setProgress(res.progress);
        if (res.stage) setCurrentStage(res.stage);

        if (res.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
        } else if (res.status === 'error') {
          clearInterval(interval);
          setErrorMsg(res.error || 'Audio analysis failed.');
          onError(res.error || 'Audio analysis failed.');
        }
      } catch (err: any) {
        // Retry
      }
    };

    interval = setInterval(checkStatus, 400);
    checkStatus();

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [projectId]);

  // Determine stage index
  const getStageState = (stageName: string, index: number) => {
    const currentIdx = STAGES.findIndex(s => currentStage.toLowerCase().includes(s.toLowerCase()));
    if (currentIdx > index || progress === 100) return 'done';
    if (currentIdx === index) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-studio-border p-8 shadow-2xl text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-card border border-studio-accent/30 text-studio-accent text-xs font-mono mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Multitrack Analysis Pipeline</span>
        </div>

        {/* Center Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-white font-sans tracking-tight">
          Listening to your takes...
        </h2>
        <p className="text-xs text-studio-textSecondary mt-2 font-mono">
          Calculating alignment offsets, phrase segments, and vocal quality metrics
        </p>

        {/* Spectrum Waveform Visualizer */}
        <div className="my-8 h-28 flex items-center justify-center px-4 rounded-xl bg-studio-surface/90 border border-studio-border/60 overflow-hidden">
          <canvas ref={canvasRef} width={420} height={100} className="w-full h-full block" />
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-studio-textSecondary uppercase tracking-wider">
              {currentStage}
            </span>
            <span className="text-studio-accent font-bold text-sm">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-studio-card border border-studio-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-studio-cyan via-studio-accent to-studio-accent rounded-full transition-all duration-300 shadow-glow-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dynamic Checklist */}
        <div className="text-left space-y-2.5 max-w-xs mx-auto border-t border-studio-border/50 pt-6">
          {STAGES.map((stage, idx) => {
            const state = getStageState(stage, idx);
            return (
              <div key={idx} className="flex items-center space-x-3 text-xs font-mono">
                {state === 'done' ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                ) : state === 'active' ? (
                  <div className="w-4 h-4 rounded-full bg-studio-accent/20 text-studio-accent flex items-center justify-center">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-studio-card text-studio-textMuted flex items-center justify-center text-[10px]">
                    ○
                  </div>
                )}
                <span className={state === 'active' ? 'text-white font-semibold' : state === 'done' ? 'text-studio-textSecondary' : 'text-studio-textMuted'}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
