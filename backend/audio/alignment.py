import numpy as np
from scipy import signal
import librosa

def estimate_take_offset(reference_audio: np.ndarray, target_audio: np.ndarray, sr: int, max_lag_seconds: float = 2.0) -> float:
    """
    Estimates the time lag (in seconds) between reference_audio and target_audio
    using cross-correlation on their onset strength envelopes.
    A positive offset means target_audio lags behind reference_audio (starts later).
    """
    try:
        # Use onset strength envelopes for robust alignment invariant to minor pitch/timbre variations
        hop_length = 512
        ref_env = librosa.onset.onset_strength(y=reference_audio, sr=sr, hop_length=hop_length)
        tar_env = librosa.onset.onset_strength(y=target_audio, sr=sr, hop_length=hop_length)

        # Standardize envelopes
        ref_env = (ref_env - np.mean(ref_env)) / (np.std(ref_env) + 1e-8)
        tar_env = (tar_env - np.mean(tar_env)) / (np.std(tar_env) + 1e-8)

        # Limit analysis to first 30 seconds for speed
        max_frames = int(30.0 * sr / hop_length)
        ref_env = ref_env[:max_frames]
        tar_env = tar_env[:max_frames]

        max_lag_frames = int(max_lag_seconds * sr / hop_length)
        correlation = signal.correlate(tar_env, ref_env, mode='full')
        lags = signal.correlation_lags(len(tar_env), len(ref_env), mode='full')

        # Restrict to search window
        valid_indices = np.where((lags >= -max_lag_frames) & (lags <= max_lag_frames))[0]
        if len(valid_indices) == 0:
            return 0.0

        best_idx = valid_indices[np.argmax(correlation[valid_indices])]
        best_lag_frames = lags[best_idx]
        offset_seconds = float(best_lag_frames * hop_length / sr)
        return round(offset_seconds, 3)
    except Exception:
        return 0.0

def align_audio_tracks(takes_audio: list[np.ndarray], sr: int) -> tuple[list[np.ndarray], list[float]]:
    """
    Aligns a list of audio arrays to the first take (reference).
    Returns:
        aligned_takes: list of np.ndarray with aligned timing and matched length
        offsets: list of offset values in seconds for each take
    """
    if not takes_audio:
        return [], []

    ref_audio = takes_audio[0]
    offsets = [0.0]
    aligned_takes = [ref_audio]

    for i in range(1, len(takes_audio)):
        tar_audio = takes_audio[i]
        offset_sec = estimate_take_offset(ref_audio, tar_audio, sr)
        offsets.append(offset_sec)

        offset_samples = int(round(offset_sec * sr))
        if offset_samples > 0:
            # Target started later than reference: trim leading delay or pad reference
            if offset_samples < len(tar_audio):
                shifted = tar_audio[offset_samples:]
            else:
                shifted = np.zeros_like(ref_audio)
        elif offset_samples < 0:
            # Target started earlier than reference: pad start with zeros
            pad_len = abs(offset_samples)
            shifted = np.pad(tar_audio, (pad_len, 0), mode='constant')
        else:
            shifted = tar_audio

        aligned_takes.append(shifted)

    # Harmonize lengths to maximum length among all takes
    max_len = max(len(t) for t in aligned_takes)
    padded_aligned_takes = []
    for t in aligned_takes:
        if len(t) < max_len:
            t_padded = np.pad(t, (0, max_len - len(t)), mode='constant')
            padded_aligned_takes.append(t_padded)
        else:
            padded_aligned_takes.append(t[:max_len])

    return padded_aligned_takes, offsets
