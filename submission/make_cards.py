"""Create the three simple title cards used in the local demo video."""

from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFont


OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"

CARDS = {
    "intro": (
        "CODEX X TWITCHCON 2026",
        "QUEST DIRECTOR",
        "Twitch chat ideas become game-specific missions.\nThe streamer stays in control.",
    ),
    "codex": (
        "BUILT WITH CODEX",
        "FROM CHAT TO OVERLAY",
        "Twitch EventSub · local AI · human approval · OBS\nSeven local tests pass.",
    ),
    "end": (
        "LOCAL DEMO",
        "MAKE CHAT PART OF THE GAME",
        "Real Twitch chat, recorded while the channel was offline.\nNo public broadcast was started.",
    ),
}

CAPTIONS = [
    (
        "A labeled test idea is posted in the real Twitch chat.",
        "The channel is offline; this is a local recording.",
    ),
    (
        "Twitch EventSub delivers it to Quest Director.",
        "A local AI checks the PUBG stream profile.",
    ),
    (
        "The streamer approves the idea before it goes on air.",
        "OBS displays the mission only after approval.",
    ),
    (
        "The test is marked as missed.",
        "Gameplay outcomes are not automatically verified.",
    ),
    (
        "Built in Codex: Twitch connection, challenge pipeline, dashboard, OBS overlay.",
        "Seven automated tests pass.",
    ),
]

for filename, (eyebrow, title, subtitle) in CARDS.items():
    image = Image.new("RGB", (1280, 720), "#0c0e0f")
    draw = ImageDraw.Draw(image)
    draw.rectangle((92, 135, 99, 585), fill="#d0fa5c")
    draw.text((135, 155), eyebrow, font=ImageFont.truetype(BOLD, 24), fill="#d0fa5c")
    draw.text((135, 265), title, font=ImageFont.truetype(BOLD, 60), fill="#f5f7ed")
    draw.multiline_text(
        (135, 405),
        subtitle,
        font=ImageFont.truetype(REGULAR, 30),
        fill="#aabbb3",
        spacing=14,
    )
    image.save(OUT / f"{filename}.png")

for index, (first, second) in enumerate(CAPTIONS, start=1):
    image = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((42, 564, 1238, 698), radius=20, fill=(5, 8, 9, 226))
    draw.rounded_rectangle((63, 585, 70, 677), radius=3, fill="#d0fa5c")
    draw.text((91, 582), first, font=ImageFont.truetype(BOLD, 27), fill="#f5f7ed")
    draw.text((91, 631), second, font=ImageFont.truetype(REGULAR, 25), fill="#b8c5bd")
    image.save(OUT / f"caption-{index}.png")

# Cover unrelated chat history in the captured Codex window. The Codex header
# and actual project file editor remain visible in the recording.
mask = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
draw = ImageDraw.Draw(mask)
draw.rectangle((340, 0, 1015, 720), fill="#101213")
draw.rectangle((0, 110, 1015, 720), fill="#101213")
draw.rectangle((60, 175, 67, 510), fill="#d0fa5c")
draw.text((90, 183), "CODEX BUILD SESSION", font=ImageFont.truetype(BOLD, 24), fill="#d0fa5c")
draw.text((90, 265), "Quest Director", font=ImageFont.truetype(BOLD, 58), fill="#f5f7ed")
draw.multiline_text(
    (90, 370),
    "Twitch EventSub\nChallenge pipeline\nOBS overlay",
    font=ImageFont.truetype(REGULAR, 29),
    fill="#b8c5bd",
    spacing=14,
)
mask.save(OUT / "codex-mask.png")

tests = Image.new("RGB", (1280, 720), "#0c0e0f")
draw = ImageDraw.Draw(tests)
draw.rectangle((92, 135, 99, 585), fill="#d0fa5c")
draw.text((135, 150), "PROJECT CHECKS", font=ImageFont.truetype(BOLD, 24), fill="#d0fa5c")
draw.text((135, 245), "7 / 7 TESTS PASS", font=ImageFont.truetype(BOLD, 62), fill="#f5f7ed")
draw.multiline_text(
    (135, 365),
    "01  Game-specific challenge filtering\n02  Approval before any on-air mission\n03  Real Twitch messages keep their source label",
    font=ImageFont.truetype(REGULAR, 29),
    fill="#b8c5bd",
    spacing=22,
)
tests.save(OUT / "tests.png")
