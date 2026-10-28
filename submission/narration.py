"""Generate a timed, local English voiceover for the 75-second review cut.

Requires kokoro-onnx, soundfile, an Apache-2.0 Kokoro model, and its voice pack.
Model files belong in recordings/ and are intentionally not committed.
"""

from pathlib import Path
import argparse
import shutil

import numpy as np
import soundfile as sf
import espeakng_loader
from kokoro_onnx import Kokoro
from kokoro_onnx.config import EspeakConfig


HERE = Path(__file__).resolve().parent
RECORDINGS = HERE / "recordings"
MODEL = RECORDINGS / "kokoro-v1.0.int8.onnx"
VOICES = RECORDINGS / "voices-v1.0.bin"
OUTPUT = RECORDINGS / "quest-director-voiceover.wav"
VIDEO_DURATION = 75.566667

# Each line starts when its matching shot becomes visible. The final line ends
# before the video ends, leaving a short tail for the end card.
SEGMENTS = [
    (0.15, 4.0, "Quest Director. Make chat part of the game."),
    (4.5, 18.5, "I posted a labeled test challenge in my real Twitch chat while the channel was offline."),
    (19.1, 29.2, "Twitch Event Sub delivered it. Local AI checked the P U B G profile and queued it for review."),
    (29.7, 41.8, "My approval put the mission on the O B S overlay. The streamer controls what appears on air."),
    (42.3, 52.3, "I marked this test as missed. Gameplay results are not automatically verified."),
    (55.4, 63.4, "I built the Twitch connection, challenge pipeline, dashboard, and O B S overlay with Codex."),
    (63.8, 71.2, "Seven automated tests pass."),
    (71.7, 75.45, "Quest Director. Chat shapes the show."),
]

TIGHT_SEGMENTS = [
    (0.15, 4.0, "Quest Director. Make chat part of the game."),
    (4.3, 10.9, "I posted a labeled test challenge in my real Twitch chat while the channel was offline."),
    (11.2, 18.4, "Twitch Event Sub delivered it. Local AI checked the P U B G profile and queued it for review."),
    (18.9, 25.9, "My approval put the mission on the O B S overlay. The streamer controls what appears on air."),
    (26.4, 32.4, "I marked this test as missed. Gameplay results are not automatically verified."),
    (32.8, 39.9, "I built the Twitch connection, challenge pipeline, dashboard, and O B S overlay with Codex."),
    (40.1, 43.4, "Seven automated tests pass."),
    (43.8, 47.4, "Quest Director. Chat shapes the show."),
]

# Longer review cut with the original brief, the Codex build log, and real
# Codex screen footage visible instead of a generic "Built with Codex" card.
CODEX_REVISION_SEGMENTS = TIGHT_SEGMENTS[:5] + [
    (32.8, 36.8, "I asked Codex to build game-specific viewer challenges."),
    (37.1, 43.9, "It created the challenge engine, Twitch connection, dashboard, and O B S overlay."),
    (44.1, 47.4, "Seven automated tests pass."),
    (47.9, 51.4, "Quest Director. Chat shapes the show."),
]
CODEX_REVISION_SEGMENTS[2] = (
    11.2, 18.4,
    "Twitch Event Sub delivered it. The local rules filter checked the selected game profile and queued it for review.",
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tight", action="store_true", help="Generate voiceover for the shorter review cut")
    parser.add_argument("--codex-revision", action="store_true", help="Generate voiceover for the Codex build review cut")
    args = parser.parse_args()
    if args.tight and args.codex_revision:
        parser.error("Choose only one cut")
    segments = CODEX_REVISION_SEGMENTS if args.codex_revision else TIGHT_SEGMENTS if args.tight else SEGMENTS
    duration = 51.5 if args.codex_revision else 47.5 if args.tight else VIDEO_DURATION
    output = RECORDINGS / "quest-director-voiceover-codex-revision.wav" if args.codex_revision else RECORDINGS / "quest-director-voiceover-tight.wav" if args.tight else OUTPUT
    # With this macOS wheel, eSpeak looks for phontab beside the bundled
    # espeak-ng-data folder. Repair the isolated venv layout on first run.
    data = Path(espeakng_loader.get_data_path())
    if not (data.parent / "phontab").exists():
        for source in data.iterdir():
            target = data.parent / source.name
            if source.is_dir():
                shutil.copytree(source, target, dirs_exist_ok=True)
            elif not target.exists():
                shutil.copy2(source, target)
    espeak = EspeakConfig(data_path=str(data.parent))
    kokoro = Kokoro(str(MODEL), str(VOICES), espeak_config=espeak)
    sample_rate = 24000
    track = np.zeros(round(duration * sample_rate), dtype=np.float32)
    for start, end, words in segments:
        samples, rate = kokoro.create(words, voice="am_michael", speed=1.06, lang="en-us")
        if rate != sample_rate:
            raise RuntimeError(f"Unexpected sample rate: {rate}")
        available = round((end - start) * rate)
        if len(samples) > available:
            raise RuntimeError(f"Line is {len(samples) / rate:.2f}s; slot is {(end - start):.2f}s: {words}")
        fade = min(round(0.08 * rate), len(samples) // 2)
        samples = samples.astype(np.float32)
        samples[:fade] *= np.linspace(0, 1, fade)
        samples[-fade:] *= np.linspace(1, 0, fade)
        offset = round(start * rate)
        track[offset : offset + len(samples)] += samples
        print(f"{start:5.1f}–{start + len(samples) / rate:5.1f}s  {words}")
    peak = max(float(np.max(np.abs(track))), 1e-6)
    track *= min(0.85 / peak, 1.0)
    sf.write(output, track, sample_rate)
    print(output)


if __name__ == "__main__":
    main()
