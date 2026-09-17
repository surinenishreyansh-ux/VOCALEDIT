import os
import numpy as np
import soundfile as sf

def generate_demo_vocal_takes(output_dir: str, num_takes: int = 10, sr: int = 22050) -> list[str]:
    """
    Generates 10 realistic synthetic vocal takes for demonstration and testing.
    Each take has authentic vocal nuances (vowel formants, vibrato, micro-pitch variations),
    with distinct takes excelling in different phrases:
      - Phrase 1 (0-4s): Take 04 excels
      - Phrase 2 (4-8s): Take 07 excels
      - Phrase 3 (8-11s): Take 02 excels
      - Phrase 4 (11-15s): Take 07/09 excels
      - Phrase 5 (15-20s): Take 03/10 excels
    """
    os.makedirs(output_dir, exist_ok=True)
    generated_files = []

    # Musical melody notes (C4, D4, E4, G4, A4, G4, E4, D4, C4)
    note_pitches = [
        261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 261.63
    ]
    note_durations = [
        2.0, 1.8, 2.2, 2.0, 2.4, 1.8, 2.0, 1.8, 2.5
    ]

    vowel_formants = [
        (800, 1200, 2500),   # /a/
        (500, 1000, 2500),   # /o/
        (300, 2200, 3000),   # /i/
        (700, 1100, 2400)    # /ah/
    ]

    # Phrase excellence assignments
    # Phrase 0: take 4
    # Phrase 1,2: take 7
    # Phrase 3,4: take 2
    # Phrase 5,6: take 7
    # Phrase 7,8: take 3
    star_takes_per_phrase = {
        0: 4, 1: 4,
        2: 7, 3: 7,
        4: 2, 5: 2,
        6: 7, 7: 9,
        8: 3
    }

    for take_idx in range(1, num_takes + 1):
        filename = f"Take_{take_idx:02d}.wav"
        file_path = os.path.join(output_dir, filename)

        total_audio = []

        # Lead timing offset (jitter)
        timing_offset = (take_idx - 1) * 0.02 - 0.04
        if timing_offset > 0:
            total_audio.append(np.random.normal(0, 0.002, int(timing_offset * sr)))

        for n_i, (f_base, dur) in enumerate(zip(note_pitches, note_durations)):
            is_star = (star_takes_per_phrase.get(n_i, 1) == take_idx)

            # Detuning: star take has 0 detune and high stability; others have small drift
            if is_star:
                f_note = f_base
                detune_jitter = 0.05
                vibrato_depth = 2.8
                vibrato_rate = 5.5
                harmonic_boost = 1.3
                noise_amp = 0.0015
            else:
                detune = np.sin((take_idx + n_i) * 1.5) * (1.8 if take_idx % 2 == 0 else -1.4)
                f_note = f_base + detune
                detune_jitter = 0.35
                vibrato_depth = 4.2 + (take_idx % 3) * 0.8
                vibrato_rate = 4.8 + (take_idx % 2) * 0.7
                harmonic_boost = 0.95
                noise_amp = 0.005 + (0.012 if take_idx == 8 else 0.0)

            num_samples = int(dur * sr)
            t = np.linspace(0, dur, num_samples, endpoint=False)

            vibrato_onset = np.clip((t - 0.3) / 0.4, 0.0, 1.0)
            vibrato = vibrato_onset * vibrato_depth * np.sin(2 * np.pi * vibrato_rate * t)
            instant_freq = f_note + vibrato + np.random.normal(0, detune_jitter, num_samples)
            phase = 2 * np.pi * np.cumsum(instant_freq) / sr

            harmonics = np.zeros(num_samples)
            formants = vowel_formants[n_i % len(vowel_formants)]
            for h in range(1, 14):
                h_freq = f_note * h
                if h_freq >= sr / 2:
                    break
                resonance = 0.0
                for f_c in formants:
                    dist = abs(h_freq - f_c)
                    resonance += np.exp(-(dist ** 2) / (2 * (160 ** 2)))
                amp = (1.0 / (h ** 0.82)) * (0.35 + 1.25 * resonance * harmonic_boost)
                harmonics += amp * np.sin(h * phase)

            # ADSR envelope
            attack_len = int(0.1 * sr)
            release_len = int(0.2 * sr)
            env = np.ones(num_samples)
            if attack_len < num_samples:
                env[:attack_len] = np.linspace(0, 1, attack_len) ** 1.3
            if release_len < num_samples:
                env[-release_len:] = np.linspace(1, 0, release_len) ** 1.3

            note_audio = harmonics * env
            breath = np.random.normal(0, noise_amp, num_samples) * env
            note_audio += breath

            # Pause between notes
            pause_len = int(0.22 * sr)
            pause_audio = np.random.normal(0, noise_amp * 0.5, pause_len)

            total_audio.append(note_audio)
            total_audio.append(pause_audio)

        audio_concat = np.concatenate(total_audio).astype(np.float32)

        peak = np.max(np.abs(audio_concat))
        if peak > 1e-6:
            audio_concat = audio_concat * (0.86 / peak)

        sf.write(file_path, audio_concat, sr, subtype="PCM_16")
        generated_files.append(file_path)

    return generated_files

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(current_dir, "demo_takes")
    takes = generate_demo_vocal_takes(out_dir, 10)
    print(f"Generated {len(takes)} nuanced demo takes in {out_dir}")
