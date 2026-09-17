import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { CreateProject } from './pages/CreateProject';
import { Processing } from './pages/Processing';
import { CompStudio } from './pages/CompStudio';
import { AudioPlayer } from './components/AudioPlayer';
import { ExportModal } from './components/ExportModal';
import { Project, Segment } from './types';
import { createProject, getCompStudioData, startAnalysis } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'create' | 'processing' | 'studio'>('landing');
  const [project, setProject] = useState<Project>({
    id: '',
    name: 'Untitled Vocal Comp',
    bpm: 120,
    key: 'C Major',
    takes: [],
    segments: [],
    comp: null,
    status: 'idle',
    progress: 0,
    stage: '',
  });

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'comp' | 'original'>('comp');

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Undo / Redo History for Segment Take Overrides
  const [history, setHistory] = useState<Segment[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize a new project on start or when needed
  useEffect(() => {
    async function init() {
      try {
        const newProj = await createProject();
        setProject(newProj);
      } catch (err) {
        console.error('Failed to init project:', err);
      }
    }
    init();
  }, []);

  const handleUpdateProject = (updated: Partial<Project>) => {
    setProject(prev => {
      const nextProj = { ...prev, ...updated };
      // Track history if segments changed
      if (updated.segments && JSON.stringify(updated.segments) !== JSON.stringify(prev.segments)) {
        const newHist = history.slice(0, historyIndex + 1);
        newHist.push(updated.segments);
        setHistory(newHist);
        setHistoryIndex(newHist.length - 1);
      }
      return nextProj;
    });
  };

  const handleStartAnalysis = async () => {
    if (!project.id) return;
    try {
      setCurrentView('processing');
      await startAnalysis(project.id);
    } catch (err) {
      console.error('Failed to start analysis:', err);
    }
  };

  const handleProcessingComplete = async () => {
    try {
      const compData = await getCompStudioData(project.id);
      setProject(prev => ({
        ...prev,
        takes: compData.takes,
        segments: compData.segments,
        comp: compData.comp,
        status: 'completed',
        progress: 100
      }));
      // Initialize history with initial segments
      setHistory([compData.segments]);
      setHistoryIndex(0);
      setCurrentView('studio');
    } catch (err) {
      console.error('Failed to fetch comp studio data:', err);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetSegments = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setProject(prev => ({ ...prev, segments: targetSegments }));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetSegments = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setProject(prev => ({ ...prev, segments: targetSegments }));
    }
  };

  // Reference take (Take 1) for A/B switcher
  const referenceTake = project.takes?.[0] || null;

  return (
    <div className="min-h-screen bg-studio-bg text-studio-textPrimary flex flex-col selection:bg-studio-accent selection:text-black">
      {/* Top Studio Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'studio' && (!project.comp || project.status !== 'completed')) {
            setCurrentView('create');
          } else {
            setCurrentView(view);
          }
        }}
        projectName={project.name}
        onExportClick={() => setIsExportOpen(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <Landing
            onCreateCompClick={() => setCurrentView('create')}
            onSeeHowItWorksClick={() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'create' && (
          <CreateProject
            project={project}
            onUpdateProject={handleUpdateProject}
            onStartAnalysis={handleStartAnalysis}
          />
        )}

        {currentView === 'processing' && (
          <Processing
            projectId={project.id}
            onComplete={handleProcessingComplete}
            onError={(msg) => console.error(msg)}
          />
        )}

        {currentView === 'studio' && (
          <CompStudio
            project={project}
            onUpdateProject={handleUpdateProject}
            onOpenExport={() => setIsExportOpen(true)}
            currentTime={currentTime}
            onSeek={(t) => setCurrentTime(t)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            playbackMode={playbackMode}
          />
        )}
      </main>

      {/* Persistent Bottom Audio Player Dock in Studio View */}
      {currentView === 'studio' && project.comp && (
        <AudioPlayer
          comp={project.comp}
          referenceTake={referenceTake}
          currentTime={currentTime}
          onTimeUpdate={(t) => setCurrentTime(t)}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          playbackMode={playbackMode}
          onTogglePlaybackMode={(mode) => setPlaybackMode(mode)}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projectId={project.id}
        projectName={project.name}
      />
    </div>
  );
}

export default App;
