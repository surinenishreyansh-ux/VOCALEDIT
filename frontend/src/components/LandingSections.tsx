import React, { useState } from 'react';
import {
  Music,
  FileText,
  Mic,
  Sliders,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Layers,
  Activity,
  Check,
  Download,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';

interface LandingSectionsProps {
  onCreateCompClick: () => void;
}

export const LandingSections: React.FC<LandingSectionsProps> = ({ onCreateCompClick }) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const togglePlayPreview = () => {
    setIsPlayingPreview(prev => !prev);
  };

  return (
    <div className="w-full space-y-28 mt-24 text-left">
      {/* ==================================================
          SECTION 1: EVERYTHING YOUR VOCAL NEEDS
          ================================================== */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-studio-card/80 border border-studio-border mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-accent" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-studio-textSecondary">
              Complete Production Context
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
            Everything Your Vocal Needs
          </h2>
          <p className="mt-4 text-base md:text-lg text-studio-textSecondary font-sans leading-relaxed">
            Give VocalEditor the context behind the performance — not just the recordings.
          </p>
        </div>

        {/* 4 Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Music */}
          <div className="group relative rounded-2xl bg-studio-surface/90 border border-studio-border/70 p-6 hover:border-studio-cyan/40 transition-all duration-300 hover:shadow-glow-cyan flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-studio-cyan/5 rounded-full blur-2xl group-hover:bg-studio-cyan/10 transition-all pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-studio-card flex items-center justify-center text-studio-cyan border border-studio-border/80 mb-5 group-hover:scale-105 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-studio-cyan uppercase tracking-wider font-semibold mb-1">
                Context Input 01
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-sans">
                Music
              </h3>
              <p className="text-xs text-studio-textSecondary leading-relaxed font-sans mb-6">
                Upload the instrumental or song so VocalEditor understands the arrangement, timing, sections, and musical context.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-mono text-studio-textMuted uppercase tracking-wider mb-2">
                Supported Examples
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Instrumental', 'Beat', 'Full Mix'].map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-studio-card/80 border border-studio-border text-[11px] font-mono text-studio-textSecondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Lyrics */}
          <div className="group relative rounded-2xl bg-studio-surface/90 border border-studio-border/70 p-6 hover:border-studio-accent/40 transition-all duration-300 hover:shadow-glow-accent flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-studio-accent/5 rounded-full blur-2xl group-hover:bg-studio-accent/10 transition-all pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-studio-card flex items-center justify-center text-studio-accent border border-studio-border/80 mb-5 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-studio-accent uppercase tracking-wider font-semibold mb-1">
                Context Input 02
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-sans">
                Lyrics
              </h3>
              <p className="text-xs text-studio-textSecondary leading-relaxed font-sans mb-6">
                Provide the lyrics so VocalEditor can understand individual lines, phrases, sections, and align vocal performances accurately.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-mono text-studio-textMuted uppercase tracking-wider mb-2">
                Section Mapping
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Verse', 'Pre-Chorus', 'Chorus', 'Bridge'].map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-studio-card/80 border border-studio-border text-[11px] font-mono text-studio-textSecondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Vocal Takes */}
          <div className="group relative rounded-2xl bg-studio-surface/90 border border-studio-border/70 p-6 hover:border-studio-cyan/40 transition-all duration-300 hover:shadow-glow-cyan flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-studio-cyan/5 rounded-full blur-2xl group-hover:bg-studio-cyan/10 transition-all pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-studio-card flex items-center justify-center text-studio-cyan border border-studio-border/80 mb-5 group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-studio-cyan uppercase tracking-wider font-semibold mb-1">
                Context Input 03
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-sans">
                Vocal Takes
              </h3>
              <p className="text-xs text-studio-textSecondary leading-relaxed font-sans mb-6">
                Upload multiple performances of the same song. VocalEditor compares them phrase-by-phrase and identifies the strongest moments.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-mono text-studio-textMuted uppercase tracking-wider mb-2">
                Performance Pool
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Take 01', 'Take 02', 'Take 03', '...', 'Take 10+'].map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-studio-card/80 border border-studio-border text-[11px] font-mono text-studio-textSecondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Your Requirements */}
          <div className="group relative rounded-2xl bg-studio-surface/90 border border-studio-border/70 p-6 hover:border-studio-accent/40 transition-all duration-300 hover:shadow-glow-accent flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-studio-accent/5 rounded-full blur-2xl group-hover:bg-studio-accent/10 transition-all pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-studio-card flex items-center justify-center text-studio-accent border border-studio-border/80 mb-5 group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-studio-accent uppercase tracking-wider font-semibold mb-1">
                Context Input 04
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-sans">
                Your Requirements
              </h3>
              <p className="text-xs text-studio-textSecondary leading-relaxed font-sans mb-6">
                Tell VocalEditor what matters most — emotion, pitch accuracy, timing, energy, clarity, phrasing, or specific performance preferences.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-mono text-studio-textMuted uppercase tracking-wider mb-2">
                Example Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Emotional', 'Clean Pitch', 'Strong Chorus', 'Natural Delivery', 'Tight Timing'].map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-studio-accent/10 border border-studio-accent/25 text-[11px] font-mono text-studio-accent font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 2: FROM TAKES TO ONE FINAL VOCAL (WORKFLOW)
          ================================================== */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl bg-studio-surface/70 border border-studio-border/80 p-8 md:p-12 relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-studio-accent/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-card border border-studio-border mb-3 text-studio-accent text-xs font-mono">
              <Workflow className="w-3.5 h-3.5" />
              <span>Visual Pipeline</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
              From Takes to One Final Vocal
            </h2>
            <p className="mt-3 text-sm md:text-base text-studio-textSecondary">
              How music, lyrics, vocal takes, and requirements flow into one seamless comp.
            </p>
          </div>

          {/* 6-Step Visual Workflow Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 relative">
            {[
              {
                step: '01',
                title: 'Add Your Song',
                sub: 'Music + Lyrics',
                desc: 'Instrumental track and lyrics define the song structure and rhythm.',
              },
              {
                step: '02',
                title: 'Upload Vocal Takes',
                sub: '10+ Performances',
                desc: 'Multi-take passes aligned automatically via onset correlation.',
              },
              {
                step: '03',
                title: 'Define Requirements',
                sub: 'Creative Goals',
                desc: 'Tell the AI what matters most across tone and energy.',
              },
              {
                step: '04',
                title: 'AI Analyzes Every Take',
                sub: 'Phrase Breakdown',
                desc: 'Evaluates pitch, timing, emotion, clarity, energy, and phrasing.',
              },
              {
                step: '05',
                title: 'Build the Best Comp',
                sub: 'Smart Selection',
                desc: 'Best phrases selected across takes with crossfade stitching.',
              },
              {
                step: '06',
                title: 'Final Vocal',
                sub: 'Production Ready',
                desc: 'One seamless production-ready vocal ready for mixdown.',
              }
            ].map((item, idx) => (
              <div
                key={item.step}
                onMouseEnter={() => setActiveStep(idx)}
                onMouseLeave={() => setActiveStep(null)}
                className={`relative rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                  activeStep === idx
                    ? 'bg-studio-cardHover border-studio-accent/50 shadow-lg -translate-y-1'
                    : 'bg-studio-card/60 border-studio-border/70 hover:border-studio-borderLight'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-studio-textMuted">
                      STEP {item.step}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        idx < 2
                          ? 'bg-studio-cyan'
                          : idx < 4
                          ? 'bg-studio-accent'
                          : 'bg-studio-success'
                      }`}
                    />
                  </div>
                  <h4 className="text-sm font-bold text-white font-sans mb-1">
                    {item.title}
                  </h4>
                  <div className="text-[11px] font-mono text-studio-accent font-medium mb-2">
                    {item.sub}
                  </div>
                  <p className="text-[11px] text-studio-textSecondary leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>

                {/* Micro flow arrow */}
                {idx < 5 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="w-5 h-5 rounded-full bg-studio-surface border border-studio-border flex items-center justify-center text-studio-textMuted">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-studio-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-studio-textMuted font-mono">
            <span>Non-destructive pipeline · Seamless raised-cosine crossfading</span>
            <span className="text-studio-cyan mt-2 sm:mt-0 font-medium">
              Every take preserved · 100% audition transparency
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 3: WHAT THE AI UNDERSTANDS
          ================================================== */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-studio-card/80 border border-studio-border mb-4 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-studio-cyan" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-studio-textSecondary">
              Audio-Production Evaluation
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
            Not Just Audio. Performance.
          </h2>
          <p className="mt-4 text-base md:text-lg text-studio-textSecondary font-sans leading-relaxed">
            VocalEditor evaluates the qualities that make one take better than another.
          </p>
        </div>

        {/* 10 Feature Chips/Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { name: 'Pitch', desc: 'Cent stability & tonal centering' },
            { name: 'Timing', desc: 'Transient onset attack precision' },
            { name: 'Rhythm', desc: 'Subdivision pocket & groove consistency' },
            { name: 'Emotion', desc: 'Dynamic intensity & vocal expression' },
            { name: 'Energy', desc: 'RMS projection & spectral punch' },
            { name: 'Clarity', desc: 'Signal-to-noise floor & presence' },
            { name: 'Phrasing', desc: 'Natural contours & breath management' },
            { name: 'Consistency', desc: 'Formant stability across phrases' },
            { name: 'Pronunciation', desc: 'Crisp enunciation without harsh sibilance' },
            { name: 'Performance Quality', desc: 'Aggregated studio-grade comp score' },
          ].map(metric => (
            <div
              key={metric.name}
              className="rounded-xl bg-studio-surface/80 border border-studio-border/70 p-4 hover:border-studio-borderLight hover:bg-studio-card/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white font-sans group-hover:text-studio-accent transition-colors">
                    {metric.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-studio-cyan" />
                </div>
                <p className="text-[11px] text-studio-textSecondary leading-snug font-sans">
                  {metric.desc}
                </p>
              </div>

              {/* Audio meter visualization */}
              <div className="mt-3 pt-2 border-t border-studio-border/40 flex items-center gap-1">
                {[0.4, 0.7, 0.5, 0.9, 0.8, 0.6].map((lvl, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full bg-studio-borderLight overflow-hidden"
                  >
                    <div
                      className="h-full bg-studio-accent/80 rounded-full"
                      style={{ width: `${lvl * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          SECTION 4: FINAL OUTPUT (ONE SONG. MULTIPLE TAKES. ONE FINAL PERFORMANCE)
          ================================================== */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl bg-studio-surface/90 border border-studio-border p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-card border border-studio-border mb-3 text-studio-cyan text-xs font-mono">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Take Convergence</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
              One Song. Multiple Takes. One Final Performance.
            </h2>
            <p className="mt-4 text-sm md:text-base text-studio-textSecondary max-w-2xl mx-auto">
              VocalEditor selects the strongest phrases from different performances and seamlessly combines them into one coherent vocal.
            </p>
          </div>

          {/* Visual DAW Mockup */}
          <div className="rounded-2xl bg-studio-bg/95 border border-studio-border/80 p-5 md:p-6 font-mono text-xs overflow-x-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-studio-border/50 pb-2 mb-3 text-[11px] text-studio-textMuted uppercase tracking-wider">
              <span>Source Takes</span>
              <div className="flex gap-4">
                <span>Phrase 1 (0-4s)</span>
                <span>Phrase 2 (4-8s)</span>
                <span>Phrase 3 (8-12s)</span>
                <span>Phrase 4 (12-16s)</span>
              </div>
              <span>Selection</span>
            </div>

            {/* 10 Source Takes Representation */}
            <div className="space-y-1.5 mb-5">
              {[
                { name: 'Take 01', isSelected: false },
                { name: 'Take 02', isSelected: true, phraseIndex: 0, phrase: 'Phrase 1 · Winner 85' },
                { name: 'Take 03', isSelected: false },
                { name: 'Take 04', isSelected: true, phraseIndex: 3, phrase: 'Phrase 4 · Winner 86' },
                { name: 'Take 05', isSelected: false },
                { name: 'Take 06', isSelected: false },
                { name: 'Take 07', isSelected: false },
                { name: 'Take 08', isSelected: true, phraseIndex: 1, phrase: 'Phrase 2 & 3 · Winner 87' },
                { name: 'Take 09', isSelected: false },
                { name: 'Take 10', isSelected: false },
              ].map((t) => (
                <div
                  key={t.name}
                  className="flex items-center gap-3 py-1 px-2.5 rounded bg-studio-surface/50 border border-studio-border/30 hover:border-studio-border"
                >
                  <span className="w-16 text-studio-textSecondary font-semibold">
                    {t.name}
                  </span>
                  <div className="flex-1 h-5 rounded bg-studio-card/80 border border-studio-border/40 relative overflow-hidden flex items-center">
                    <div
                      className={`h-full border-r border-studio-border/40 flex items-center justify-center text-[10px] px-2 ${
                        t.name === 'Take 02'
                          ? 'w-1/4 bg-studio-accent text-black font-bold'
                          : 'w-1/4 opacity-30 text-studio-textMuted'
                      }`}
                    >
                      {t.name === 'Take 02' ? '★ Take 02' : 'Take 01'}
                    </div>
                    <div
                      className={`h-full border-r border-studio-border/40 flex items-center justify-center text-[10px] px-2 ${
                        t.name === 'Take 08'
                          ? 'w-1/4 bg-studio-accent text-black font-bold'
                          : 'w-1/4 opacity-30 text-studio-textMuted'
                      }`}
                    >
                      {t.name === 'Take 08' ? '★ Take 08' : 'Take 08'}
                    </div>
                    <div
                      className={`h-full border-r border-studio-border/40 flex items-center justify-center text-[10px] px-2 ${
                        t.name === 'Take 08'
                          ? 'w-1/4 bg-studio-accent text-black font-bold'
                          : 'w-1/4 opacity-30 text-studio-textMuted'
                      }`}
                    >
                      {t.name === 'Take 08' ? '★ Take 08' : 'Take 08'}
                    </div>
                    <div
                      className={`h-full flex items-center justify-center text-[10px] px-2 ${
                        t.name === 'Take 04'
                          ? 'w-1/4 bg-studio-cyan text-black font-bold'
                          : 'w-1/4 opacity-30 text-studio-textMuted'
                      }`}
                    >
                      {t.name === 'Take 04' ? '★ Take 04' : 'Take 04'}
                    </div>
                  </div>
                  <span className="w-24 text-right text-[10px] text-studio-textMuted">
                    {t.isSelected ? (
                      <span className="text-studio-accent font-semibold">AI Selected</span>
                    ) : (
                      'Candidate'
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Convergence Divider */}
            <div className="flex items-center justify-center gap-3 py-2.5 border-y border-studio-border/60 bg-studio-card/40 my-3 text-studio-accent">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-studio-accent/50" />
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                ↓ AI Comp · Seamless Crossfade Stitching
              </span>
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-studio-accent/50" />
            </div>

            {/* Final Master Channel */}
            <div className="rounded-xl bg-gradient-to-r from-studio-card via-studio-cardHover to-studio-card border-2 border-studio-accent/60 p-4 shadow-glow-accent">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-studio-accent animate-pulse" />
                  <span className="font-bold text-white text-sm">
                    FINAL VOCAL
                  </span>
                </div>
                <span className="text-[11px] text-studio-cyan font-semibold">
                  Coherent · Studio-Grade WAV
                </span>
              </div>

              {/* Master Waveform representation */}
              <div className="h-10 w-full rounded-lg bg-studio-surface border border-studio-border/80 flex items-center px-3 relative overflow-hidden">
                <div className="w-full flex items-center justify-between gap-1">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const h = Math.sin(i * 0.28) * 14 + 18 + (i % 4) * 3;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < 16
                            ? 'bg-studio-accent'
                            : i < 32
                            ? 'bg-studio-accent/90'
                            : i < 48
                            ? 'bg-studio-accent/80'
                            : 'bg-studio-cyan'
                        }`}
                        style={{ height: `${Math.min(h, 32)}px` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={togglePlayPreview}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-studio-card hover:bg-studio-cardHover text-white border border-studio-border hover:border-studio-borderLight text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              {isPlayingPreview ? (
                <>
                  <Pause className="w-4 h-4 text-studio-accent fill-studio-accent" />
                  Pause Comp
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-studio-accent fill-studio-accent" />
                  Listen to Final Comp
                </>
              )}
            </button>
            <button
              onClick={onCreateCompClick}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-studio-accent hover:bg-studio-accentHover text-black text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-glow-accent group"
            >
              Create a Comp
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 5: PRODUCER STAYS IN CONTROL
          ================================================== */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="rounded-3xl bg-studio-surface/80 border border-studio-border/70 p-8 md:p-12 relative overflow-hidden backdrop-blur-md">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-card border border-studio-border mb-4 text-studio-success text-xs font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Non-Destructive Workflow</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
              AI Makes the First Decision. You Make the Final Call.
            </h2>
            <p className="mt-4 text-base text-studio-textSecondary leading-relaxed font-sans">
              VocalEditor creates an intelligent first-pass comp while keeping every creative decision editable. Review, replace, refine, and export the final performance.
            </p>
          </div>

          {/* Interactive UI Control Badges */}
          <div className="mt-8 pt-8 border-t border-studio-border/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: 'AI Selected',
                desc: 'Audition metric winner',
                icon: Sparkles,
                badgeColor: 'text-studio-accent border-studio-accent/30 bg-studio-accent/10'
              },
              {
                label: 'Replace Take',
                desc: '1-click manual swap',
                icon: RefreshCw,
                badgeColor: 'text-studio-cyan border-studio-cyan/30 bg-studio-cyan/10'
              },
              {
                label: 'Preview',
                desc: 'Solo phrase audition',
                icon: Eye,
                badgeColor: 'text-white border-studio-border bg-studio-card'
              },
              {
                label: 'Accept',
                desc: 'Commit phrase choice',
                icon: Check,
                badgeColor: 'text-studio-success border-studio-success/30 bg-studio-success/10'
              },
              {
                label: 'Refine',
                desc: 'Crossfades & gain trim',
                icon: Sliders,
                badgeColor: 'text-studio-accent border-studio-accent/30 bg-studio-accent/10'
              },
              {
                label: 'Export',
                desc: '24-bit broadcast WAV',
                icon: Download,
                badgeColor: 'text-studio-cyan border-studio-cyan/30 bg-studio-cyan/10'
              }
            ].map(ctrl => {
              const IconComponent = ctrl.icon;
              return (
                <div
                  key={ctrl.label}
                  className="rounded-xl bg-studio-card/70 border border-studio-border p-3.5 hover:border-studio-borderLight transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg border ${ctrl.badgeColor}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white font-sans">
                      {ctrl.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-studio-textMuted font-mono">
                    {ctrl.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
