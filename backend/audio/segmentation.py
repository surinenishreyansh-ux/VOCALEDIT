import numpy as np
import librosa

def segment_audio(audio: np.ndarray, sr: int, min_duration: float = 2.0, max_duration: float = 5.0, target_duration: float = 3.5) -> list[dict]:
    """
    Divides audio into sensible 2-5 second segments, adapting cut boundaries
    to natural dips in RMS energy (silence / breath / pause) to avoid cutting mid-word.
    """
    total_duration = float(len(audio) / sr)
    if total_duration <= max_duration:
        return [{
            "id": "seg-0",
            "start": 0.0,
            "end": round(total_duration, 2),
            "duration": round(total_duration, 2)
        }]

    # Compute short-time RMS energy
    hop_length = 512
    frame_length = 2048
    rms = librosa.feature.rms(y=audio, frame_length=frame_length, hop_length=hop_length)[0]
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)

    segments = []
    current_start = 0.0
    seg_idx = 0

    while current_start < total_duration:
        # Proposed end time based on target duration
        nominal_end = current_start + target_duration
        if nominal_end + min_duration >= total_duration:
            # Last segment takes the rest
            segments.append({
                "id": f"seg-{seg_idx}",
                "start": round(current_start, 2),
                "end": round(total_duration, 2),
                "duration": round(total_duration - current_start, 2)
            })
            break

        # Search window for energy minimum around nominal_end: ±0.75s
        search_start = max(current_start + min_duration, nominal_end - 0.75)
        search_end = min(current_start + max_duration, nominal_end + 0.75)

        # Find frames within search window
        frame_mask = (times >= search_start) & (times <= search_end)
        if np.any(frame_mask):
            window_rms = rms[frame_mask]
            window_times = times[frame_mask]
            # Minimum energy frame (silence or breath)
            min_idx = np.argmin(window_rms)
            cut_point = float(window_times[min_idx])
        else:
            cut_point = nominal_end

        # Ensure cut point is strictly forward
        cut_point = min(cut_point, total_duration)
        if cut_point - current_start < min_duration:
            cut_point = min(current_start + min_duration, total_duration)

        segments.append({
            "id": f"seg-{seg_idx}",
            "start": round(current_start, 2),
            "end": round(cut_point, 2),
            "duration": round(cut_point - current_start, 2)
        })

        current_start = cut_point
        seg_idx += 1

    return segments
