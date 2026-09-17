export interface Take {
  id: string;
  take_number: number;
  filename: string;
  file_url: string;
  file_path: string;
  duration: number;
  waveform: number[];
  offset_sec?: number;
}

export interface SegmentMetrics {
  pitch: number;
  timing: number;
  clarity: number;
  noise: number;
  energy: number;
  overall: number;
}

export interface Segment {
  id: string;
  index: number;
  start: number;
  end: number;
  duration: number;
  selected_take_id: string;
  score: number;
  metrics: SegmentMetrics;
  reason: string;
  take_scores: Record<string, SegmentMetrics>;
}

export interface CompData {
  file_url: string;
  file_path: string;
  duration: number;
  waveform: number[];
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  key: string;
  takes: Take[];
  segments: Segment[];
  comp: CompData | null;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  stage: string;
  error?: string | null;
}
