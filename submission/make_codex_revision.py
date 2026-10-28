"""Build a review cut that shows the real Codex build process.

The brief and file list come from the original Codex conversation on
2026-10-28. The moving background is an actual later Codex screen recording.
Its unrelated chat history and an OBS preview window are covered for privacy.
"""

from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont


HERE = Path(__file__).resolve().parent
RECORDINGS = HERE / "recordings"
CARDS = RECORDINGS / "cards"
PROMPT = CARDS / "codex-original-brief.png"
MASK = CARDS / "codex-build-evidence-mask.png"
FILTER_CAPTION = CARDS / "rules-filter-caption.png"
SILENT = RECORDINGS / "quest-director-demo-codex-revision-silent.mp4"
VOICE = RECORDINGS / "quest-director-voiceover-codex-revision.wav"
OUTPUT = RECORDINGS / "quest-director-demo-codex-revision.mp4"

BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
BG = "#0c0e0f"
WHITE = "#f5f7ed"
MUTED = "#b8c5bd"
LIME = "#d0fa5c"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def make_images() -> None:
    CARDS.mkdir(parents=True, exist_ok=True)

    brief = Image.new("RGB", (1280, 720), BG)
    d = ImageDraw.Draw(brief)
    d.rectangle((92, 135, 99, 585), fill=LIME)
    d.text((135, 155), "01 / ORIGINAL CODEX BRIEF", font=font(25, True), fill=LIME)
    d.text((135, 235), "The idea started here", font=font(53, True), fill=WHITE)
    d.multiline_text(
        (135, 335),
        '"Make an AI director of viewer challenges\n'
        "that each streamer can customize. For PUBG,\n"
        'accept ideas related to that game."',
        font=font(34), fill=WHITE, spacing=12,
    )
    d.text((135, 620), "Translated from the original Russian request in Codex", font=font(22), fill=MUTED)
    brief.save(PROMPT)

    # The recorded run visibly used rule fallback, so correct the old caption
    # that called this particular check "AI".
    caption = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
    d = ImageDraw.Draw(caption)
    d.rounded_rectangle((42, 564, 1238, 698), radius=20, fill=(5, 8, 9, 255))
    d.rounded_rectangle((63, 585, 70, 677), radius=3, fill=LIME)
    d.text((91, 582), "Twitch EventSub delivers it to Quest Director.", font=font(27, True), fill=WHITE)
    d.text((91, 631), "The local rules filter checks the game profile.", font=font(25), fill=MUTED)
    caption.save(FILTER_CAPTION)

    # Overlay on a genuine later Codex recording. Hide unrelated chat and the
    # later demo-documentation diff. Show original-build log facts separately,
    # so the video does not imply the later diff created the app itself.
    mask = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
    d = ImageDraw.Draw(mask)
    d.rectangle((0, 165, 456, 720), fill=(12, 14, 15, 255))
    d.rectangle((69, 120, 455, 165), fill=(12, 14, 15, 255))
    d.rectangle((456, 0, 1017, 720), fill=(12, 14, 15, 255))
    d.rectangle((56, 187, 64, 649), fill=LIME)
    d.text((89, 187), "02 / BUILT WITH CODEX", font=font(23, True), fill=LIME)
    d.text((89, 247), "From brief", font=font(38, True), fill=WHITE)
    d.text((89, 293), "to working app", font=font(38, True), fill=WHITE)
    for y, line in (
        (373, "Challenge engine"),
        (421, "Twitch EventSub"),
        (469, "Streamer dashboard"),
        (517, "OBS overlay"),
    ):
        d.text((89, y), line, font=font(27), fill=WHITE)
    d.multiline_text(
        (89, 591), "Original session log\n+ later Codex recording",
        font=font(20), fill=MUTED, spacing=5,
    )
    d.text((486, 93), "Original Codex build activity", font=font(27, True), fill=WHITE)
    d.text((486, 141), "Verified from the project session log", font=font(21), fill=MUTED)
    for y, line in (
        (255, "+ ai.mjs, core.mjs"),
        (303, "+ server.mjs, overlay.js"),
        (351, "+ dashboard, tests"),
        (424, "$ node --check"),
        (472, "$ npm test: 7 passed"),
    ):
        d.text((486, y), line, font=font(24), fill=WHITE)
    d.text((486, 600), "Right: real Codex editor, later review", font=font(20), fill=MUTED)
    mask.save(MASK)


def render() -> None:
    # Keep the already approved functional demo through the result at 32.5s.
    # Replace the old generic Codex card and masked code shot with a readable
    # prompt, authentic session evidence, and an actual Codex recording.
    inputs = [
        "-i", str(RECORDINGS / "quest-director-demo-tight-silent.mp4"),
        "-loop", "1", "-framerate", "30", "-t", "4.5", "-i", str(PROMPT),
        "-i", str(RECORDINGS / "2026-10-28 15-35-34.mov"),
        "-loop", "1", "-framerate", "30", "-t", "7", "-i", str(MASK),
        "-loop", "1", "-framerate", "30", "-t", "3.5", "-i", str(CARDS / "tests.png"),
        "-loop", "1", "-framerate", "30", "-t", "4", "-i", str(CARDS / "end.png"),
        "-loop", "1", "-framerate", "30", "-t", "32.5", "-i", str(FILTER_CAPTION),
    ]
    graph = (
        "[0:v]trim=start=0:end=32.5,setpts=PTS-STARTPTS,fps=30,scale=1280:720[base];"
        "[base][6:v]overlay=0:0:enable='between(t,11,18.5)',format=yuv420p[v0];"
        "[1:v]trim=duration=4.5,setpts=PTS-STARTPTS,format=yuv420p[v1];"
        "[2:v]trim=start=7:end=14,setpts=PTS-STARTPTS,fps=30,scale=1280:720[raw];"
        "[raw][3:v]overlay=0:0:shortest=1,trim=duration=7,setpts=PTS-STARTPTS,format=yuv420p[v2];"
        "[4:v]trim=duration=3.5,setpts=PTS-STARTPTS,format=yuv420p[v3];"
        "[5:v]trim=duration=4,setpts=PTS-STARTPTS,format=yuv420p[v4];"
        "[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[out]"
    )
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
         "-filter_complex", graph, "-map", "[out]", "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "20",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(SILENT)],
        check=True,
    )
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
         "-i", str(SILENT), "-i", str(VOICE),
         "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-t", "51.5",
         "-movflags", "+faststart", str(OUTPUT)],
        check=True,
    )
    print(OUTPUT)


if __name__ == "__main__":
    make_images()
    render()
