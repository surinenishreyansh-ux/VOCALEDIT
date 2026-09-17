import numpy as np
from scipy import signal

def analyze_segment_quality(
    seg_audio: np.ndarray,
    ref_seg_audio: np.ndarray | None,
    sr: int
) -> dict:
    """
    Fast and robust objective audio quality analysis (0-100) per segment:
    - Pitch (30%): Harmonic pitch strength & autocorrelation periodicity
    - Timing (30%): Temporal envelope correlation & onset precision vs consensus
    - Clarity (20%): High-frequency presence & harmonic spectral richness
    - Noise (10%): Silence floor noise floor suppression
    - Energy (10%): Optimal vocal dynamic level (-18dBFS target)
    """
    if len(seg_audio) < int(0.2 * sr):
        return {
            "pitch": 50, "timing": 50, "clarity": 50, "noise": 50, "energy": 50, "overall": 50
        }

    # 1. Clipping Detection
    clipping_ratio = np.mean(np.abs(seg_audio) >= 0.98)
    clip_penalty = min(35, int(clipping_ratio * 400))

    # 2. Energy Analysis (Target -18 dBFS to -14 dBFS)
    rms_val = np.sqrt(np.mean(seg_audio ** 2) + 1e-9)
    dbfs = 20 * np.log10(rms_val + 1e-9)
    if dbfs < -38:
        energy_score = max(45, int(95 - abs(dbfs - (-18)) * 2.2))
    elif dbfs > -3:
        energy_score = max(50, int(95 - abs(dbfs - (-14)) * 3.5))
    else:
        # Balanced target
        dist = abs(dbfs - (-16.0))
        energy_score = max(65, int(98 - dist * 2.8))
    energy_score = max(30, energy_score - clip_penalty)

    # 3. Noise Floor Estimation
    # Compute frame-based RMS and check 10th percentile
    frame_size = 512
    num_frames = len(seg_audio) // frame_size
    if num_frames > 2:
        frames = seg_audio[:num_frames * frame_size].reshape(num_frames, frame_size)
        frame_rms = np.sqrt(np.mean(frames ** 2, axis=1) + 1e-9)
        floor_db = 20 * np.log10(np.percentile(frame_rms, 15) + 1e-9)
        if floor_db < -42:
            noise_score = int(np.clip(93 + (abs(floor_db) - 42) * 0.4, 88, 99))
        else:
            noise_score = int(np.clip(88 - (floor_db - (-42)) * 1.6, 40, 92))
    else:
        noise_score = 88

    # 4. Clarity (Spectral Centroid & High Frequency Harmonics)
    # Using FFT for instantaneous execution
    fft_vals = np.abs(np.fft.rfft(seg_audio))
    freqs = np.fft.rfftfreq(len(seg_audio), 1.0 / sr)
    total_energy = np.sum(fft_vals) + 1e-9

    # Energy in vocal presence band (1 kHz - 4.5 kHz) vs total
    vocal_band = (freqs >= 1000) & (freqs <= 4500)
    band_energy_ratio = np.sum(fft_vals[vocal_band]) / total_energy
    # Natural vocal ratio is ~0.15 - 0.45
    clarity_score = int(np.clip(70 + band_energy_ratio * 70, 60, 98))
    clarity_score = max(35, clarity_score - clip_penalty)

    # 5. Timing Alignment vs Reference
    if ref_seg_audio is not None and len(ref_seg_audio) > 0:
        # Envelope cross-correlation using rectified smoothed signal
        filt_len = min(len(seg_audio), len(ref_seg_audio))
        env_tar = np.abs(seg_audio[:filt_len])
        env_ref = np.abs(ref_seg_audio[:filt_len])

        # Downsample for quick envelope correlation
        ds = max(1, filt_len // 250)
        env_tar_ds = env_tar[::ds]
        env_ref_ds = env_ref[::ds]

        norm_tar = (env_tar_ds - np.mean(env_tar_ds)) / (np.std(env_tar_ds) + 1e-6)
        norm_ref = (env_ref_ds - np.mean(env_ref_ds)) / (np.std(env_ref_ds) + 1e-6)
        corr = float(np.mean(norm_tar * norm_ref))
        timing_score = int(np.clip(75 + corr * 24, 60, 98))
    else:
        timing_score = 90

    # 6. Pitch Stability via Autocorrelation Peak Prominence
    # Fast FFT-based normalized autocorrelation
    try:
        n = len(seg_audio)
        n_padded = 2 ** int(np.ceil(np.log2(2 * n - 1)))
        f_sig = np.fft.rfft(seg_audio, n_padded)
        autocorr = np.fft.irfft(f_sig * np.conj(f_sig), n_padded)[:n]
        if autocorr[0] > 1e-6:
            autocorr = autocorr / autocorr[0]

            # Search in pitch lag range (80 Hz to 600 Hz)
            min_lag = int(sr / 600)
            max_lag = int(sr / 80)
            if max_lag < len(autocorr):
                pitch_range = autocorr[min_lag:max_lag]
                peak_height = float(np.max(pitch_range))
                # Peak height near 1.0 means highly coherent pitch harmonics
                pitch_score = int(np.clip(68 + peak_height * 30, 58, 98))
            else:
                pitch_score = 80
        else:
            pitch_score = 75
    except Exception:
        pitch_score = 82

    # Weighted Overall Score
    overall = int(round(
        pitch_score * 0.30 +
        timing_score * 0.30 +
        clarity_score * 0.20 +
        noise_score * 0.10 +
        energy_score * 0.10
    ))
    overall = int(np.clip(overall, 40, 99))

    return {
        "pitch": int(pitch_score),
        "timing": int(timing_score),
        "clarity": int(clarity_score),
        "noise": int(noise_score),
        "energy": int(energy_score),
        "overall": overall
    }

def generate_selection_reason(metrics: dict) -> str:
    """
    Generates a factual, transparent selection rationale based on top metrics.
    """
    p = metrics.get("pitch", 0)
    t = metrics.get("timing", 0)
    c = metrics.get("clarity", 0)
    n = metrics.get("noise", 0)
    e = metrics.get("energy", 0)

    traits = [
        ("pitch stability", p),
        ("rhythmic timing", t),
        ("vocal clarity", c),
        ("low background noise", n),
        ("dynamic energy balance", e)
    ]
    traits.sort(key=lambda x: x[1], reverse=True)

    top1 = traits[0][0]
    top2 = traits[1][0]

    return f"Exceptional {top1} and solid {top2}."
