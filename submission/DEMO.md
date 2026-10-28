# Local demo plan (under 3 minutes)

The final video must show the project working with Twitch and show Codex use. Record locally in OBS; do not start a Twitch broadcast. Use the real `tem1rrllan` channel chat while the channel is offline. The final upload to YouTube is a separate step.

## Before recording

1. Start the app with `AI_PROVIDER=ollama npm start`. If the model is unavailable, use rules-only mode and say so in the video.
2. Open the dashboard at `http://127.0.0.1:4175/` and the Twitch channel chat. Reauthorize `user:read:chat` after a server restart; tokens are held in memory only.
3. Confirm the dashboard reads `LIVE #tem1rrllan`. In OBS, keep the `Quest Director Demo` scene with the Browser Source URL `http://localhost:4175/overlay.html`.
4. Prepare a short, relevant chat suggestion. The streamer may send it from their own channel for the demo, clearly identified as a test message. Do not claim it came from an independent viewer.
5. Keep credentials, OAuth callback fragments, private tabs, and personal notifications out of the recording.

## Shot list

| Time | Show | Narration idea |
| --- | --- | --- |
| 0:00–0:20 | Dashboard profile and Twitch connection | “Quest Director turns chat ideas into missions tailored to the game I choose.” |
| 0:20–0:55 | Real Twitch chat message and matching `TWITCH` card in the queue | “This test message arrived through Twitch EventSub. The AI checks the idea against my PUBG profile.” |
| 0:55–1:30 | Approve the card, then OBS overlay | “The challenge never goes on screen until I approve it.” |
| 1:30–1:55 | Mark the mission complete or missed; show history | “I control the outcome. The app does not pretend to verify PUBG gameplay.” |
| 1:55–2:25 | Codex session and a brief view of the project/tests | “I built the Twitch connection, challenge pipeline, dashboard, and overlay with Codex. Seven local tests pass.” |
| 2:25–2:40 | Final overlay and short callout | “Chat shapes the show; the streamer remains the director.” |

## Export check

- Duration below 3:00, in English or with accurate English subtitles.
- Actual Twitch chat and a card labeled `TWITCH` are visible; do not substitute the demo feed for this shot.
- OBS overlay and Codex use are visible.
- No copyrighted music, unauthorized footage, access tokens, or private information.
- Upload the finished video to YouTube as **Public**, then add its URL to Devpost.
