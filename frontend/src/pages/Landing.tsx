import React from 'react';
import { ArrowRight, Sparkles, Sliders, Mic, ShieldCheck, Play, Layers } from 'lucide-react';
import { HeroVisual } from '../components/HeroVisual';

interface LandingProps {
  onCreateCompClick: () => void;
  onSeeHowItWorksClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({
  onCreateCompClick,
  onSeeHowItWorksClick
}) => {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden pb-20">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-studio-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-60 left-1/4 w-[400px] h-[250px] bg-studio-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-studio-card/90 border border-studio-border mb-8 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-studio-accent animate-pulse" />
          <span className="text-xs font-mono font-medium text-studio-textSecondary">
            AI-Assisted Vocal Comping Engine
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto font-sans leading-[1.1]">
          Your best vocal.{' '}
          <span className="bg-gradient-to-r from-white via-studio-textPrimary to-studio-textMuted bg-clip-text text-transparent">
            Built from every take.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base md:text-lg text-studio-textSecondary max-w-2xl mx-auto font-sans font-normal leading-relaxed">
          VocalEditor analyzes your vocal performances and creates an intelligent first-pass comp from the strongest moments of every take.
        </p>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCreateCompClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-studio-accent hover:bg-studio-accentHover text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-accent transition-all active:scale-95 group"
          >
            Create a Comp
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onSeeHowItWorksClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-studio-card hover:bg-studio-cardHover text-white border border-studio-border hover:border-studio-borderLight font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-studio-cyan fill-studio-cyan" />
            See How It Works
          </button>
        </div>

        {/* Interactive Hero Visual */}
        <div className="mt-16 md:mt-20">
          <HeroVisual />
        </div>

        {/* 3 Core Pillars */}
        <div id="how-it-works" className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl p-6 border border-studio-border hover:border-studio-borderLight transition-all">
            <div className="w-10 h-10 rounded-xl bg-studio-card flex items-center justify-center text-studio-cyan border border-studio-border mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Intelligent Alignment
            </h3>
            <p className="text-xs text-studio-textSecondary leading-relaxed">
              Automatic time-lag correlation matches onset attacks across all 2–10 takes, ensuring identical vocal phrases align perfectly.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-studio-border hover:border-studio-borderLight transition-all">
            <div className="w-10 h-10 rounded-xl bg-studio-card flex items-center justify-center text-studio-accent border border-studio-border mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Deep Quality Scoring
            </h3>
            <p className="text-xs text-studio-textSecondary leading-relaxed">
              Every segment is scored from 0 to 100 on pitch stability, timing precision, vocal clarity, noise floor, and dynamic energy.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-studio-border hover:border-studio-borderLight transition-all">
            <div className="w-10 h-10 rounded-xl bg-studio-card flex items-center justify-center text-studio-success border border-studio-border mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Producer In Control
            </h3>
            <p className="text-xs text-studio-textSecondary leading-relaxed">
              VocalEditor generates an Initial Comp, not a black-box claim. Audition candidate takes and manually swap any segment with 1 click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
