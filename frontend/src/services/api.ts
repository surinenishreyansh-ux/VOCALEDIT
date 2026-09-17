import { Project, CompData, Segment } from '../types';

export const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = `${API_HOST}/api`;

export function getAudioUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_HOST}${path}`;
}

export async function createProject(name: string = 'Untitled Vocal Comp', bpm: number = 120, key: string = 'C Major'): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bpm, key })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProject(projectId: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function loadDemoTakes(projectId: string): Promise<{ takes_count: number; takes: any[] }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/load-demo`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadTakes(projectId: string, files: File[]): Promise<{ takes_count: number; takes: any[] }> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  const res = await fetch(`${API_BASE}/projects/${projectId}/takes`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to upload files.' }));
    throw new Error(errorData.detail || 'Failed to upload files.');
  }
  return res.json();
}

export async function deleteTake(projectId: string, takeId: string): Promise<{ takes_count: number }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/takes/${takeId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function startAnalysis(projectId: string): Promise<{ status: string; project_id: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/analyze`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed to start' }));
    throw new Error(err.detail || 'Analysis failed to start');
  }
  return res.json();
}

export async function getAnalysisStatus(projectId: string): Promise<{ status: string; progress: number; stage: string; error?: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/status`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCompStudioData(projectId: string): Promise<{
  project_id: string;
  name: string;
  bpm: number;
  key: string;
  takes: any[];
  segments: Segment[];
  comp: CompData;
}> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/comp`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function replaceSegmentTake(projectId: string, segmentId: string, takeId: string): Promise<{
  status: string;
  segment: Segment;
  comp: CompData;
  segments: Segment[];
}> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/segments/${segmentId}/replace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ take_id: takeId })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getExportUrl(projectId: string, format: string = 'wav', bitDepth: number = 24): string {
  return `${API_BASE}/projects/${projectId}/export?format=${format}&bit_depth=${bitDepth}`;
}
