"""Trim still shots from the review cut and mux its timed narration.

Run after `narration.py --tight` has generated the voice track.
"""

from pathlib import Path
import subprocess


HERE = Path(__file__).resolve().parent
RECORDINGS = HERE / "recordings"
SOURCE = RECORDINGS / "quest-director-demo.mp4"
SILENT = RECORDINGS / "quest-director-demo-tight-silent.mp4"
VOICE = RECORDINGS / "quest-director-voiceover-tight.wav"
OUTPUT = RECORDINGS / "quest-director-demo-tight.mp4"

# Retain each visible result, shorten the stationary chat/overlay/dashboard
# holds, and leave the final end card on screen long enough to read.
CUTS = [
    (0.0, 4.0),      # Intro
    (4.0, 11.0),     # Real Twitch chat, labeled test
    (19.0, 26.5),    # Twitch-sourced approval card
    (29.0, 36.5),    # Approval and OBS mission
    (42.0, 48.5),    # Missed result
    (52.5, 55.5),    # Built with Codex title
    (55.5, 60.0),    # Codex workspace
    (63.5, 67.0),    # Passing tests
    (71.5, 75.5),    # End card
]


def main() -> None:
    split = "[0:v]split=" + str(len(CUTS)) + "".join(f"[s{i}]" for i in range(len(CUTS))) + ";"
    trims = "".join(
        f"[s{i}]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{i}];"
        for i, (start, end) in enumerate(CUTS)
    )
    concat = "".join(f"[v{i}]" for i in range(len(CUTS))) + f"concat=n={len(CUTS)}:v=1:a=0[out]"
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(SOURCE),
            "-filter_complex", split + trims + concat, "-map", "[out]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
            str(SILENT),
        ],
        check=True,
    )
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(SILENT),
            "-i", str(VOICE), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
            "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-t", "47.5", str(OUTPUT),
        ],
        check=True,
    )
    print(OUTPUT)


if __name__ == "__main__":
    main()
