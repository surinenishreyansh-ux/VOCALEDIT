import React from 'react';
import { Layers, Sliders, Settings, Command, User, Download, RotateCcw, RotateCw } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'create' | 'processing' | 'studio';
  onNavigate: (view: 'landing' | 'create' | 'studio') => void;
  projectName?: string;
  onExportClick?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  projectName,
  onExportClick,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-studio-border px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 group focus:outline-none"
          >
            {/* Minimal Monogram Logo: V + Waveform + Timeline */}
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-studio-card to-[#1B202D] border border-studio-border flex items-center justify-center shadow-studio group-hover:border-studio-accent/50 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* V shape intersecting waveform bars */}
                <path d="M4 6L12 20L20 6" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="10" x2="8" y2="15" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="12" y1="13" x2="12" y2="18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="10" x2="16" y2="15" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-base font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                VocalEditor
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-studio-accent/15 text-studio-accent border border-studio-accent/25">
                  V1
                </span>
              </span>
              <span className="text-[10px] text-studio-textMuted tracking-wider uppercase font-medium">
                AI Vocal Comping
              </span>
            </div>
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-studio-border/60">
            <button
              onClick={() => onNavigate('create')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'create'
                  ? 'text-white bg-studio-card border border-studio-border'
                  : 'text-studio-textSecondary hover:text-white hover:bg-studio-card/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-studio-accent" />
              Projects
            </button>
            <button
              onClick={() => onNavigate('studio')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'studio'
                  ? 'text-white bg-studio-card border border-studio-border'
                  : 'text-studio-textSecondary hover:text-white hover:bg-studio-card/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-studio-cyan" />
              Comp Studio
            </button>
            <button
              onClick={() => {}}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-studio-textMuted hover:text-studio-textSecondary transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </nav>
        </div>

        {/* In Studio: Center Project Title & Undo/Redo */}
        {currentView === 'studio' && (
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-xs font-medium text-studio-textPrimary px-3 py-1 rounded bg-studio-card/80 border border-studio-border/80">
              {projectName || 'Untitled Vocal Comp'}
            </span>
            <div className="flex items-center space-x-1 text-studio-textMuted">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo"
                className={`p-1.5 rounded hover:bg-studio-card hover:text-white transition-colors ${!canUndo ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo"
                className={`p-1.5 rounded hover:bg-studio-card hover:text-white transition-colors ${!canRedo ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Right Action Icons */}
        <div className="flex items-center space-x-3">
          {currentView === 'studio' && onExportClick && (
            <button
              onClick={onExportClick}
              className="px-3.5 py-1.5 rounded-md bg-studio-accent text-black hover:bg-studio-accentHover font-semibold text-xs flex items-center gap-1.5 shadow-glow-accent transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export Comp
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded bg-studio-card border border-studio-border text-studio-textMuted text-[11px] font-mono">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>

          <div className="w-7 h-7 rounded-full bg-studio-card border border-studio-border flex items-center justify-center text-studio-textSecondary hover:text-white transition-colors cursor-pointer">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
};
