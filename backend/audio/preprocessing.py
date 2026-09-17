import os
import numpy as np
import soundfile as sf
import librosa

TARGET_SR = 22050

def load_and_normalize_audio(file_path: str, target_sr: int = TARGET_SR):
    """
    Loads an audio file (WAV, MP3, M4A, FLAC), converts to mono, resamples to target_sr,
    and applies peak normalization.
    Returns:
        y: np.ndarray (float32, 1D mono)
        sr: int (target_sr)
        duration: float (in seconds)
    """
    try:
        # Try librosa first as it handles multiple formats (mp3, m4a, wav, flac) gracefully
        y, sr = librosa.load(file_path, sr=target_sr, mono=True)
    except Exception as e:
        # Fallback to soundfile if librosa encounters format-specific issue
        try:
            data, orig_sr = sf.read(file_path)
            if data.ndim > 1:
                data = np.mean(data, axis=1)
            if orig_sr != target_sr:
                data = librosa.resample(data.astype(np.float32), orig_sr=orig_sr, target_sr=target_sr)
            y, sr = data.astype(np.float32), target_sr
        except Exception as sf_err:
            raise RuntimeError(f"Failed to load audio {file_path}: {e} / {sf_err}")

    # Ensure float32
    y = y.astype(np.float32)

    # Avoid complete silence division
    peak = np.max(np.abs(y))
    if peak > 1e-6:
        # Normalize to peak -1 dB (~0.891)
        target_peak = 0.891
        y = y * (target_peak / peak)

    duration = float(len(y) / sr)
    return y, sr, duration

def extract_waveform_envelope(y: np.ndarray, num_points: int = 300) -> list[float]:
    """
    Extracts a downsampled peak envelope for fast frontend waveform visualization.
    Returns a list of float values normalized between 0.05 and 1.0.
    """
    if len(y) == 0:
        return [0.05] * num_points

    # Chunk the audio array into num_points segments
    chunk_size = max(1, len(y) // num_points)
    envelope = []
    for i in range(num_points):
        start = i * chunk_size
        end = min(len(y), (i + 1) * chunk_size)
        if start >= len(y):
            envelope.append(0.05)
        else:
            chunk = y[start:end]
            val = float(np.max(np.abs(chunk))) if len(chunk) > 0 else 0.05
            envelope.append(round(max(0.05, min(1.0, val)), 3))

    return envelope

def save_wav(file_path: str, y: np.ndarray, sr: int = TARGET_SR, subtype: str = "PCM_16"):
    """
    Saves audio numpy array to WAV file.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    # Clip to -1.0 .. 1.0 to prevent overflow
    y_clipped = np.clip(y, -0.999, 0.999)
    sf.write(file_path, y_clipped, sr, subtype=subtype)
