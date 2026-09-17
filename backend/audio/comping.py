import numpy as np
import soundfile as sf
from .preprocessing import extract_waveform_envelope, save_wav

def crossfade_stitch_segments(
    segments_config: list[dict],
    takes_audio: dict[str, np.ndarray],
    sr: int,
    crossfade_sec: float = 0.035
) -> np.ndarray:
    """
    Stitches audio segments from selected takes using smooth raised-cosine crossfades.
    segments_config: list of dicts with {"start": float, "end": float, "take_id": str}
    takes_audio: dict mapping take_id -> np.ndarray
    """
    if not segments_config:
        return np.zeros(int(sr * 1.0), dtype=np.float32)

    fade_samples = max(8, int(crossfade_sec * sr))
    # Raised-cosine fade curves
    fade_t = np.linspace(0, np.pi / 2, fade_samples)
    fade_in = (np.sin(fade_t) ** 2).astype(np.float32)
    fade_out = (np.cos(fade_t) ** 2).astype(np.float32)

    # Extract raw segment audio for each chosen take
    raw_segments = []
    for seg in segments_config:
        take_id = seg["take_id"]
        take_arr = takes_audio.get(take_id)
        if take_arr is None or len(take_arr) == 0:
            # Fallback to zeros
            dur = max(0.1, seg["end"] - seg["start"])
            seg_slice = np.zeros(int(dur * sr), dtype=np.float32)
        else:
            s_idx = max(0, int(round(seg["start"] * sr)))
            e_idx = min(len(take_arr), int(round(seg["end"] * sr)))
            if e_idx <= s_idx:
                e_idx = min(len(take_arr), s_idx + int(0.5 * sr))
            seg_slice = take_arr[s_idx:e_idx].copy().astype(np.float32)
        raw_segments.append(seg_slice)

    # Stitch with crossfade
    if len(raw_segments) == 1:
        stitched = raw_segments[0]
    else:
        stitched = raw_segments[0]
        for next_seg in raw_segments[1:]:
            if len(stitched) < fade_samples or len(next_seg) < fade_samples:
                stitched = np.concatenate([stitched, next_seg])
            else:
                # Overlap crossfade tail of stitched with head of next_seg
                stitched_body = stitched[:-fade_samples]
                stitched_tail = stitched[-fade_samples:] * fade_out
                next_head = next_seg[:fade_samples] * fade_in
                blended = stitched_tail + next_head
                next_body = next_seg[fade_samples:]
                stitched = np.concatenate([stitched_body, blended, next_body])

    # Peak normalization on final output
    peak = np.max(np.abs(stitched))
    if peak > 1e-6:
        stitched = stitched * (0.891 / peak)

    return stitched.astype(np.float32)

def generate_comp_audio(
    project_id: str,
    segments: list[dict],
    takes_audio: dict[str, np.ndarray],
    sr: int,
    output_path: str
) -> dict:
    """
    Generates and saves the initial comp audio file, returning path, duration, and waveform.
    """
    comp_audio = crossfade_stitch_segments(segments, takes_audio, sr)
    save_wav(output_path, comp_audio, sr=sr, subtype="PCM_16")

    duration = round(float(len(comp_audio) / sr), 2)
    waveform = extract_waveform_envelope(comp_audio, num_points=300)

    return {
        "output_path": output_path,
        "duration": duration,
        "waveform": waveform
    }
