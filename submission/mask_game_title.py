"""Mask a third-party game name in the contest demonstration.

The original capture remains in recordings/. The labeled masks only cover the
game title; all UI actions, timing and Twitch delivery are real.
"""

from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont


RECORDINGS = Path(__file__).resolve().parent / "recordings"
SOURCE = RECORDINGS / "quest-director-demo-codex-revision.mp4"
OUTPUT = RECORDINGS / "quest-director-demo-submission.mp4"
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"


def mask(name: str, marks: list[tuple[int, int, int, int, str, int]]) -> Path:
    image = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for x, y, width, height, color, size in marks:
        draw.rectangle((x, y, x + width, y + height), fill=color)
        draw.text((x + 2, y + (height - size) // 2 - 1), " [game]",
                  font=ImageFont.truetype(FONT, size), fill="#f5f7ed")
    path = RECORDINGS / f"{name}-redaction.png"
    image.save(path)
    return path


def main() -> None:
    images = [
        mask("chat", [(430, 131, 80, 38, "#18191b", 19)]),
        mask("queue", [
            (356, 330, 48, 26, "#242b2f", 12),
            (356, 354, 39, 20, "#242b2f", 9),
        ]),
        mask("dashboard", [
            (846, 328, 57, 27, "#39483a", 13),
            (873, 479, 55, 26, "#111a18", 13),
        ]),
        mask("overlay", [(185, 607, 83, 38, "#111a18", 19)]),
    ]
    args = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(SOURCE)]
    for path in images:
        args.extend(["-loop", "1", "-framerate", "30", "-i", str(path)])
    graph = (
        "[0:v][1:v]overlay=0:0:enable='between(t,3.4,10.9)'[v1];"
        "[v1][2:v]overlay=0:0:enable='between(t,10.9,17.2)'[v2];"
        "[v2][3:v]overlay=0:0:enable='between(t,17.2,23)+between(t,26,32.5)'[v3];"
        "[v3][4:v]overlay=0:0:enable='between(t,23,26.1)'[out]"
    )
    args.extend(["-filter_complex", graph, "-map", "[out]", "-map", "0:a:0",
                 "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                 "-pix_fmt", "yuv420p", "-c:a", "copy", "-t", "51.5",
                 "-movflags", "+faststart", str(OUTPUT)])
    subprocess.run(args, check=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
