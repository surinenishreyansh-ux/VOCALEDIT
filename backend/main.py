import os
import uuid
import time
import shutil
import asyncio
from typing import Optional
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from audio.preprocessing import load_and_normalize_audio, extract_waveform_envelope, save_wav, TARGET_SR
from audio.alignment import align_audio_tracks
from audio.segmentation import segment_audio
from audio.scoring import analyze_segment_quality, generate_selection_reason
from audio.comping import generate_comp_audio, crossfade_stitch_segments
from demo_takes_generator import generate_demo_vocal_takes

app = FastAPI(title="VocalEditor API", version="1.0.0")

# Enable CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
DEMO_DIR = os.path.join(BASE_DIR, "demo_takes")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(DEMO_DIR, exist_ok=True)

# Mount static audio files
app.mount("/audio/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/audio/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")
app.mount("/audio/demo", StaticFiles(directory=DEMO_DIR), name="demo")

# In-memory project state store
PROJECTS: dict[str, dict] = {}
PROJECT_AUDIO_CACHE: dict[str, dict[str, np.ndarray]] = {} # project_id -> {take_id: np.ndarray}

class ProjectCreate(BaseModel):
    name: Optional[str] = "Untitled Vocal Comp"
    bpm: Optional[int] = 120
    key: Optional[str] = "C Major"

class ReplaceSegmentRequest(BaseModel):
    take_id: str

@app.get("/")
def read_root():
    return {"status": "ok", "app": "VocalEditor AI Vocal Comping Engine", "version": "1.0.0"}

@app.post("/api/projects")
def create_project(payload: ProjectCreate):
    proj_id = str(uuid.uuid4())[:8]
    PROJECTS[proj_id] = {
        "id": proj_id,
        "name": payload.name or "Untitled Vocal Comp",
        "bpm": payload.bpm or 120,
        "key": payload.key or "C Major",
        "created_at": time.time(),
        "takes": [],
        "segments": [],
        "comp": None,
        "status": "idle",
        "progress": 0,
        "stage": "",
        "error": None
    }
    PROJECT_AUDIO_CACHE[proj_id] = {}
    return PROJECTS[proj_id]

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")
    return PROJECTS[project_id]

@app.post("/api/projects/{project_id}/load-demo")
def load_demo_takes(project_id: str):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    # Ensure demo files are generated
    demo_files = [f for f in os.listdir(DEMO_DIR) if f.endswith(".wav")]
    if len(demo_files) < 10:
        generate_demo_vocal_takes(DEMO_DIR, 10)
        demo_files = [f for f in os.listdir(DEMO_DIR) if f.endswith(".wav")]
    demo_files.sort()

    project = PROJECTS[project_id]
    project["takes"] = []
    PROJECT_AUDIO_CACHE[project_id] = {}

    proj_upload_dir = os.path.join(UPLOADS_DIR, project_id)
    os.makedirs(proj_upload_dir, exist_ok=True)

    for i, df in enumerate(demo_files[:10], start=1):
        take_id = f"take_{i:02d}"
        src_path = os.path.join(DEMO_DIR, df)
        dst_path = os.path.join(proj_upload_dir, df)
        shutil.copyfile(src_path, dst_path)

        y, sr, duration = load_and_normalize_audio(dst_path)
        waveform = extract_waveform_envelope(y, num_points=300)
        PROJECT_AUDIO_CACHE[project_id][take_id] = y

        project["takes"].append({
            "id": take_id,
            "take_number": i,
            "filename": df,
            "file_url": f"/audio/uploads/{project_id}/{df}",
            "file_path": dst_path,
            "duration": round(duration, 2),
            "waveform": waveform
        })

    return {"status": "ok", "takes_count": len(project["takes"]), "takes": project["takes"]}

@app.post("/api/projects/{project_id}/takes")
async def upload_takes(project_id: str, files: list[UploadFile] = File(...)):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    project = PROJECTS[project_id]
    if len(project["takes"]) + len(files) > 10:
        raise HTTPException(status_code=400, detail="VocalEditor supports up to 10 takes in this version.")

    proj_upload_dir = os.path.join(UPLOADS_DIR, project_id)
    os.makedirs(proj_upload_dir, exist_ok=True)

    allowed_exts = {".wav", ".mp3", ".m4a", ".flac"}

    for upload in files:
        ext = os.path.splitext(upload.filename)[1].lower()
        if ext not in allowed_exts:
            raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'. Try WAV, MP3, M4A, or FLAC.")

        take_num = len(project["takes"]) + 1
        take_id = f"take_{take_num:02d}"
        safe_filename = f"Take_{take_num:02d}_{os.path.basename(upload.filename)}"
        save_path = os.path.join(proj_upload_dir, safe_filename)

        with open(save_path, "wb") as f:
            content = await upload.read()
            f.write(content)

        try:
            y, sr, duration = load_and_normalize_audio(save_path)
        except Exception as e:
            if os.path.exists(save_path):
                os.remove(save_path)
            raise HTTPException(status_code=400, detail=f"We couldn't analyze {upload.filename}. Please try another recording.")

        if duration < 1.0:
            if os.path.exists(save_path):
                os.remove(save_path)
            raise HTTPException(status_code=400, detail=f"{upload.filename} is too short to create a reliable comp.")

        waveform = extract_waveform_envelope(y, num_points=300)
        PROJECT_AUDIO_CACHE[project_id][take_id] = y

        project["takes"].append({
            "id": take_id,
            "take_number": take_num,
            "filename": upload.filename,
            "file_url": f"/audio/uploads/{project_id}/{safe_filename}",
            "file_path": save_path,
            "duration": round(duration, 2),
            "waveform": waveform
        })

    return {"status": "ok", "takes_count": len(project["takes"]), "takes": project["takes"]}

@app.delete("/api/projects/{project_id}/takes/{take_id}")
def delete_take(project_id: str, take_id: str):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    project = PROJECTS[project_id]
    project["takes"] = [t for t in project["takes"] if t["id"] != take_id]
    if take_id in PROJECT_AUDIO_CACHE.get(project_id, {}):
        del PROJECT_AUDIO_CACHE[project_id][take_id]

    # Re-index take numbers
    for idx, t in enumerate(project["takes"], start=1):
        t["take_number"] = idx

    return {"status": "ok", "takes_count": len(project["takes"])}

def run_project_analysis_sync(project_id: str):
    """
    Executes real audio processing pipeline across all takes:
    1. Audio Loading & Normalization
    2. Alignment
    3. Segmentation
    4. Quality Scoring across every take
    5. Best Segment Selection
    6. Crossfade Stitching
    """
    project = PROJECTS[project_id]
    takes = project["takes"]

    if len(takes) < 2:
        project["status"] = "error"
        project["error"] = "Upload at least 2 takes to analyze."
        return

    try:
        project["status"] = "processing"

        # Stage 1: Importing Audio
        project["stage"] = "Importing audio"
        project["progress"] = 15
        time.sleep(0.3)

        audio_list = []
        for t in takes:
            tid = t["id"]
            if tid not in PROJECT_AUDIO_CACHE[project_id]:
                y, sr, _ = load_and_normalize_audio(t["file_path"])
                PROJECT_AUDIO_CACHE[project_id][tid] = y
            audio_list.append(PROJECT_AUDIO_CACHE[project_id][tid])

        # Stage 2: Normalizing recordings
        project["stage"] = "Normalizing recordings"
        project["progress"] = 30
        time.sleep(0.3)

        # Stage 3: Detecting vocal regions
        project["stage"] = "Detecting vocal regions"
        project["progress"] = 45
        time.sleep(0.3)

        # Stage 4: Aligning performances
        project["stage"] = "Aligning performances"
        project["progress"] = 60
        aligned_audio, offsets = align_audio_tracks(audio_list, sr=TARGET_SR)
        for idx, t in enumerate(takes):
            t["offset_sec"] = offsets[idx]
            PROJECT_AUDIO_CACHE[project_id][t["id"]] = aligned_audio[idx]

        # Stage 5: Segmenting takes
        project["stage"] = "Segmenting takes"
        project["progress"] = 75
        time.sleep(0.3)
        ref_audio = aligned_audio[0]
        consensus_audio = np.mean(aligned_audio, axis=0)
        raw_segments = segment_audio(consensus_audio, sr=TARGET_SR, min_duration=2.0, max_duration=4.5)

        # Stage 6: Comparing performances & Scoring
        project["stage"] = "Comparing performances"
        project["progress"] = 88
        time.sleep(0.3)

        processed_segments = []
        for seg_idx, r_seg in enumerate(raw_segments):
            s_sec = r_seg["start"]
            e_sec = r_seg["end"]
            s_sample = int(round(s_sec * TARGET_SR))
            e_sample = int(round(e_sec * TARGET_SR))

            ref_seg_slice = consensus_audio[s_sample:e_sample]

            take_scores = {}
            for t_idx, t in enumerate(takes):
                t_audio = aligned_audio[t_idx]
                seg_slice = t_audio[s_sample:min(len(t_audio), e_sample)]
                metrics = analyze_segment_quality(seg_slice, ref_seg_slice, sr=TARGET_SR)
                take_scores[t["id"]] = metrics

            # Select best take (highest overall score)
            best_take_id = max(take_scores.keys(), key=lambda tid: take_scores[tid]["overall"])
            best_metrics = take_scores[best_take_id]
            reason = generate_selection_reason(best_metrics)

            processed_segments.append({
                "id": r_seg["id"],
                "index": seg_idx + 1,
                "start": s_sec,
                "end": e_sec,
                "duration": round(e_sec - s_sec, 2),
                "selected_take_id": best_take_id,
                "score": best_metrics["overall"],
                "metrics": best_metrics,
                "reason": reason,
                "take_scores": take_scores
            })

        # Stage 7: Building Initial Comp
        project["stage"] = "Building initial comp"
        project["progress"] = 96
        time.sleep(0.3)

        out_filename = f"comp_{project_id}.wav"
        comp_output_path = os.path.join(OUTPUTS_DIR, out_filename)

        segments_cfg = [
            {"start": s["start"], "end": s["end"], "take_id": s["selected_take_id"]}
            for s in processed_segments
        ]

        comp_result = generate_comp_audio(
            project_id=project_id,
            segments=segments_cfg,
            takes_audio=PROJECT_AUDIO_CACHE[project_id],
            sr=TARGET_SR,
            output_path=comp_output_path
        )

        project["segments"] = processed_segments
        project["comp"] = {
            "file_url": f"/audio/outputs/{out_filename}",
            "file_path": comp_output_path,
            "duration": comp_result["duration"],
            "waveform": comp_result["waveform"]
        }

        project["progress"] = 100
        project["stage"] = "Analysis complete"
        project["status"] = "completed"

    except Exception as err:
        project["status"] = "error"
        project["error"] = f"Processing error: {str(err)}"

@app.post("/api/projects/{project_id}/analyze")
async def start_analysis(project_id: str, background_tasks: BackgroundTasks):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    project = PROJECTS[project_id]
    if len(project["takes"]) < 2:
        raise HTTPException(status_code=400, detail="VocalEditor requires 2–10 takes to analyze.")

    project["status"] = "processing"
    project["progress"] = 5
    project["stage"] = "Starting audio analysis pipeline"

    background_tasks.add_task(run_project_analysis_sync, project_id)
    return {"status": "started", "project_id": project_id}

@app.get("/api/projects/{project_id}/status")
def get_analysis_status(project_id: str):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    p = PROJECTS[project_id]
    return {
        "status": p["status"],
        "progress": p["progress"],
        "stage": p["stage"],
        "error": p.get("error")
    }

@app.get("/api/projects/{project_id}/comp")
def get_comp_studio_data(project_id: str):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    p = PROJECTS[project_id]
    if p["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Project comp is not ready (status: {p['status']})")

    return {
        "project_id": p["id"],
        "name": p["name"],
        "bpm": p["bpm"],
        "key": p["key"],
        "takes": p["takes"],
        "segments": p["segments"],
        "comp": p["comp"]
    }

@app.post("/api/projects/{project_id}/segments/{segment_id}/replace")
def replace_segment_take(project_id: str, segment_id: str, payload: ReplaceSegmentRequest):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    project = PROJECTS[project_id]
    take_id = payload.take_id

    # Verify take_id exists
    take_exists = any(t["id"] == take_id for t in project["takes"])
    if not take_exists:
        raise HTTPException(status_code=400, detail=f"Take '{take_id}' not found in project.")

    target_seg = None
    for seg in project["segments"]:
        if seg["id"] == segment_id:
            target_seg = seg
            break

    if not target_seg:
        raise HTTPException(status_code=404, detail=f"Segment '{segment_id}' not found.")

    # Update segment choice and metrics
    target_seg["selected_take_id"] = take_id
    metrics = target_seg["take_scores"].get(take_id, {
        "pitch": 85, "timing": 85, "clarity": 85, "noise": 85, "energy": 85, "overall": 85
    })
    target_seg["score"] = metrics["overall"]
    target_seg["metrics"] = metrics
    target_seg["reason"] = generate_selection_reason(metrics) + " (Manually overridden)"

    # Re-stitch audio with smooth crossfades
    out_filename = f"comp_{project_id}.wav"
    comp_output_path = os.path.join(OUTPUTS_DIR, out_filename)

    segments_cfg = [
        {"start": s["start"], "end": s["end"], "take_id": s["selected_take_id"]}
        for s in project["segments"]
    ]

    comp_result = generate_comp_audio(
        project_id=project_id,
        segments=segments_cfg,
        takes_audio=PROJECT_AUDIO_CACHE[project_id],
        sr=TARGET_SR,
        output_path=comp_output_path
    )

    project["comp"] = {
        "file_url": f"/audio/outputs/{out_filename}?t={int(time.time()*1000)}",
        "file_path": comp_output_path,
        "duration": comp_result["duration"],
        "waveform": comp_result["waveform"]
    }

    return {
        "status": "updated",
        "segment": target_seg,
        "comp": project["comp"],
        "segments": project["segments"]
    }

@app.get("/api/projects/{project_id}/export")
def export_comp(project_id: str, format: str = "wav", bit_depth: int = 24):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    p = PROJECTS[project_id]
    if not p.get("comp"):
        raise HTTPException(status_code=400, detail="Initial comp has not been generated yet.")

    src_wav = p["comp"]["file_path"]
    if not os.path.exists(src_wav):
        raise HTTPException(status_code=404, detail="Comp audio file not found on server.")

    clean_name = p["name"].strip().replace(" ", "_")
    if not clean_name:
        clean_name = "Initial_Vocal_Comp"

    format_lower = format.lower()
    if format_lower == "wav":
        subtype = "PCM_24" if bit_depth == 24 else "PCM_16"
        export_filename = f"{clean_name}_{bit_depth}bit.wav"
        export_path = os.path.join(OUTPUTS_DIR, f"export_{project_id}_{bit_depth}bit.wav")

        data, sr, _ = load_and_normalize_audio(src_wav)
        save_wav(export_path, data, sr=sr, subtype=subtype)

        return FileResponse(
            export_path,
            media_type="audio/wav",
            filename=export_filename,
            headers={"Content-Disposition": f'attachment; filename="{export_filename}"'}
        )
    elif format_lower == "mp3":
        export_filename = f"{clean_name}_320k.mp3"
        export_path = os.path.join(OUTPUTS_DIR, f"export_{project_id}.mp3")

        # Use soundfile / pydub / librosa or high quality WAV fallback for mp3
        try:
            import soundfile as sf
            data, sr = sf.read(src_wav)
            sf.write(export_path, data, sr, format='MP3')
        except Exception:
            # If mp3 encoder isn't installed in libsndfile, copy wav with proper disposition
            export_path = src_wav
            export_filename = f"{clean_name}.wav"

        return FileResponse(
            export_path,
            media_type="audio/mpeg" if export_path.endswith(".mp3") else "audio/wav",
            filename=export_filename,
            headers={"Content-Disposition": f'attachment; filename="{export_filename}"'}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Choose 'wav' or 'mp3'.")
