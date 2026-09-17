# VocalEditor — AI Vocal Comping Engine V1

> **Your best vocal. Built from every take.**
> An AI-powered vocal comping system that analyzes multiple vocal takes, and automatically selects, aligns, and seamlessly combines the best time frames into a studio-ready final vocal.

VocalEditor analyzes multiple recorded vocal performances (2–10 takes), aligns them, segments them into natural vocal phrases, scores each phrase across objective audio metrics (pitch stability, timing alignment, vocal clarity, noise floor, dynamic energy), selects the best segment from each take, crossfades them together, and produces a single **Initial Comp** — a high-quality first-pass vocal edit.

The result is an *Initial Comp*, not a claimed "perfect vocal." The producer stays fully in control.

---

## ✅ What V1 Does

| Capability | Status |
|---|---|
| Upload 2–10 vocal takes (WAV / MP3 / M4A / FLAC) | ✅ |
| Load 10 synthesized demo takes (1-click test) | ✅ |
| Individual take playback with waveform scrubber | ✅ |
| Automatic cross-correlation audio alignment | ✅ |
| Adaptive vocal phrase segmentation (2–5s) | ✅ |
| Per-segment objective quality scoring (0–100) | ✅ |
| Different takes selected per phrase | ✅ |
| 35ms raised-cosine crossfade stitching | ✅ |
| Initial Comp generation as `initial_comp.wav` | ✅ |
| Multi-track DAW timeline visualization | ✅ |
| Segment inspector with metric breakdowns | ✅ |
| Manual take override (re-stitches immediately) | ✅ |
| Take audition compare mode for each segment | ✅ |
| Persistent A/B Before/After player | ✅ |
| Export: WAV 24-bit, WAV 16-bit, MP3 | ✅ |
| Undo/Redo segment history | ✅ |

---

## Architecture

```
VOCALEDIT/
├── backend/                     # Python FastAPI audio processing engine
│   ├── main.py                  # REST API + project state store
│   ├── requirements.txt
│   ├── audio/
│   │   ├── preprocessing.py     # Load, resample, peak normalize, waveform extraction
│   │   ├── alignment.py         # Onset-envelope cross-correlation alignment
│   │   ├── segmentation.py      # RMS energy boundary detection + segmentation
│   │   ├── scoring.py           # Pitch/timing/clarity/noise/energy 0–100 scoring
│   │   └── comping.py           # Raised-cosine crossfade stitching + normalization
│   ├── demo_takes_generator.py  # Synthesizes 10 realistic vocal takes with formants
│   ├── test_pipeline.py         # Offline audio pipeline unit test
│   └── test_api.py              # Live API integration test
│
└── frontend/                    # React + TypeScript + Vite + Tailwind CSS
    └── src/
        ├── components/
        │   ├── Navbar.tsx           # Studio navigation with logo
        │   ├── HeroVisual.tsx       # Animated canvas multi-take convergence visual
        │   ├── WaveformCanvas.tsx   # High-DPI canvas waveform renderer
        │   ├── TakeCard.tsx         # Take player with seek/volume/waveform
        │   ├── SegmentBlock.tsx     # Comp track segment with take label and score
        │   ├── SegmentInspector.tsx # Metrics, change take, compare audition
        │   ├── AudioPlayer.tsx      # Persistent bottom dock + A/B switcher
        │   └── ExportModal.tsx      # WAV/MP3 export dialog
        └── pages/
            ├── Landing.tsx          # Cinematic hero landing with convergence visual
            ├── CreateProject.tsx    # Project setup + drag-drop upload zone
            ├── Processing.tsx       # Multi-stage AI analysis screen
            └── CompStudio.tsx       # Multi-track DAW timeline centerpiece
```

---

## Requirements

### System Requirements
- **Python** 3.11+ (tested: Python 3.14)
- **Node.js** 18+ / **npm** 9+ (tested: Node.js 24, npm 11)
- Windows 10/11 (primary target), macOS, or Linux

> **Note**: FFmpeg is **not required**. Audio loading uses `librosa` + `soundfile` which handle WAV, MP3, M4A, and FLAC natively via libsndfile.

---

## Windows Setup — Step by Step

### 1. Clone / Download the project

```powershell
cd C:\Users\YourName\Desktop
# If using git:
git clone <repo-url> VOCALEDIT
cd VOCALEDIT
# Or just extract the zip to C:\Users\YourName\Desktop\VOCALEDIT
```

---

### 2. Backend Setup (Python FastAPI)

Open **PowerShell** and navigate to the project root:

```powershell
cd C:\Users\YourName\Desktop\VOCALEDIT
```

Install Python dependencies:

```powershell
python -m pip install numpy scipy soundfile librosa fastapi uvicorn python-multipart
```

This installs all required audio processing and API packages (~350 MB total including llvmlite/numba for librosa).

Generate the 10 demo vocal takes (optional, they are auto-generated on first use):

```powershell
python backend/demo_takes_generator.py
```

Start the FastAPI backend server:

```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --cwd backend
```

Or from the backend folder directly:

```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

### 3. Frontend Setup (React + Vite)

Open a **second PowerShell window** and navigate to the frontend folder:

```powershell
cd C:\Users\YourName\Desktop\VOCALEDIT\frontend
```

Install npm dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

You should see:

```
VITE v8.x ready in 300ms
➜  Local:   http://localhost:5173/
```

---

### 4. Open VocalEditor

Open your browser and go to:

```
http://localhost:5173
```

---

## Demo Walkthrough (Steps 1–15)

Follow the complete MVP demonstration:

1. **Open** `http://localhost:5173` — see the cinematic landing with the multi-track convergence animation
2. **Click** `Create a Comp`
3. **Click** `Load 10 Demo Takes (1-Click)` OR drag and drop 2–10 real WAV/MP3 files
4. **Play** any individual take using the ▶ button and hear real audio with the waveform scrubber
5. **Click** `Analyze Takes` — requires 2–10 takes
6. **Watch** the AI Processing screen: spectrum visualizer, real-time stage checklist, progress bar
7. **Comp Studio** opens automatically when analysis completes
8. **See** the multi-track timeline with all 10 take waveforms and the AI-selected **INITIAL COMP** segment blocks
9. **See** segment selection, e.g.:
   ```
   0.0s–4.1s  → Take_01 (Score: 82)
   4.1s–6.9s  → Take_03 (Score: 87)
   6.9s–11.2s → Take_01 (Score: 82)
   ```
10. **Play** the AI Comp on the persistent bottom player
11. **Click** any segment block → inspect score breakdown (Pitch, Timing, Clarity, Noise, Energy) and AI selection reason
12. **Click** `Change Take` tab → select a different take → VocalEditor re-crossfades and updates the comp instantly
13. **Click** `Compare` tab → audition each candidate take for just that phrase time range
14. **Toggle** `Original / AI Comp` A/B switcher on the bottom player
15. **Click** `Export Comp` → choose WAV 24-bit or MP3 → download `Initial_Vocal_Comp.wav`

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/projects` | Create a new project |
| `POST` | `/api/projects/{id}/takes` | Upload audio files (2–10 max) |
| `POST` | `/api/projects/{id}/load-demo` | Load 10 demo takes |
| `DELETE` | `/api/projects/{id}/takes/{take_id}` | Remove a take |
| `POST` | `/api/projects/{id}/analyze` | Start AI analysis pipeline (background) |
| `GET` | `/api/projects/{id}/status` | Poll processing progress & stage |
| `GET` | `/api/projects/{id}/comp` | Get full comp studio data |
| `POST` | `/api/projects/{id}/segments/{seg_id}/replace` | Manual take override + re-stitch |
| `GET` | `/api/projects/{id}/export?format=wav&bit_depth=24` | Download exported audio |

Static audio served at: `/audio/uploads/{project_id}/{file}` and `/audio/outputs/{file}`

---

## Scoring Algorithm

| Metric | Weight | Measurement |
|---|---|---|
| **Pitch Stability** | 30% | FFT autocorrelation peak prominence in vocal pitch range (80–600 Hz) |
| **Timing Alignment** | 30% | Hilbert envelope cross-correlation vs consensus reference track |
| **Vocal Clarity** | 20% | Vocal presence band (1–4.5 kHz) energy ratio in full spectrum |
| **Noise Suppression** | 10% | 15th percentile RMS of short-time frames (noise floor estimate) |
| **Dynamic Energy** | 10% | RMS dBFS closeness to target vocal range (−18 to −12 dBFS) |

Scores are computed from actual uploaded audio, never hardcoded. Clipping is detected and penalizes clarity and energy scores.

---

## Future Roadmap (Not in V1)

| Version | Feature |
|---|---|
| V2 | Lyrics input → forced alignment to vocal phonemes |
| V3 | MIDI / melody-guided segment prioritization |
| V4 | Natural language producer direction ("prioritize emotional delivery") |
| V5 | ML-based emotion, pronunciation, and expression analysis |

The scoring pipeline in `backend/audio/scoring.py` is designed as a modular, replaceable scoring function so V5 ML models can be plugged in without changing the segmentation or stitching layers.

---

## Running Tests

### Audio Pipeline Unit Test (no server required)

```powershell
cd C:\Users\YourName\Desktop\VOCALEDIT
python backend/test_pipeline.py
```

### Live API Integration Test (server must be running)

```powershell
python backend/test_api.py
```

---

## Troubleshooting

**`librosa` import fails on first run**
> Numba JIT compilation runs on first import — this can take 5–10 seconds and is normal.

**`python` command not found**
> Use `py` or `python3` instead, or ensure Python is added to PATH.

**Port 8000 already in use**
> Change the port: `python -m uvicorn main:app --port 8001` and update `vite.config.ts` proxy target accordingly.

**Audio file `m4a` doesn't load**
> Some M4A files require FFmpeg. Install FFmpeg from https://ffmpeg.org/download.html and add it to PATH. The app will use librosa's FFmpeg backend automatically.

**CORS error in browser console**
> Ensure the backend is running on port 8000. The Vite dev server proxies `/api` and `/audio` to `127.0.0.1:8000`.
>>>>>>> 243283a (feat: VocalEditor V1 — Premium AI Vocal Comping MVP)
