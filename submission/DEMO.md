# Local demo plan (under 3 minutes)

The [public demo video](https://youtu.be/zrnfwS6Rb74) shows the project working with Twitch and shows how it was built with Codex. It was recorded locally in OBS without starting a Twitch broadcast, using the real `tem1rrllan` channel chat while the channel was offline.

## Current local review cut

`recordings/quest-director-demo-submission.mp4` is the published 51.5-second, 1280×720 cut with English captions and a local Kokoro voiceover. It shows a labeled test message in the real Twitch chat, the Twitch-sourced approval card, the OBS mission overlay, the adapted original user request, original Codex build activity from the session log, clearly labeled later Codex editor footage, and seven passing tests. The name of the example game is visibly replaced with `[game]` for the contest video; the original capture remains locally archived. The recorded run used the rules filter. The Twitch channel remained offline. Earlier cuts and raw OBS recordings are in the same ignored `recordings/` directory. `make_cards.py` generates the title cards and caption graphics; `narration.py --codex-revision` generates the voice track; `make_codex_revision.py` assembles the video; `mask_game_title.py` creates the submission cut. The script is in `NARRATION.md`.

## Before recording

1. Start the app with `AI_PROVIDER=ollama npm start`. If the model is unavailable, use rules-only mode and say so in the video.
2. Open the dashboard at `http://127.0.0.1:4175/` and the Twitch channel chat. Reauthorize `user:read:chat` after a server restart; tokens are held in memory only.
3. Confirm the dashboard reads `LIVE #tem1rrllan`. In OBS, keep the `Quest Director Demo` scene with the Browser Source URL `http://localhost:4175/overlay.html`.
4. Prepare a short, relevant chat suggestion. The streamer may send it from their own channel for the demo, clearly identified as a test message. Do not claim it came from an independent viewer.
5. Keep credentials, OAuth callback fragments, private tabs, and personal notifications out of the recording.

## Final review cut shot list

| Time | Show | Narration idea |
| --- | --- | --- |
| 0:00–0:04 | Quest Director title | Introduce the project. |
| 0:04–0:11 | Labeled test idea in the real Twitch chat | Explain that the channel was offline. |
| 0:11–0:19 | Matching `TWITCH` card in the queue | Describe EventSub and game-profile filtering. |
| 0:19–0:26 | Streamer approval and OBS mission overlay | Show that approval controls what appears on air. |
| 0:26–0:33 | Mark the mission missed | Explain that gameplay outcomes are not automatically verified. |
| 0:33–0:37 | Translated original user request | Show the initial game-specific challenge brief. |
| 0:37–0:44 | Original Codex build activity and labeled later editor footage | Show what Codex built and distinguish the recording time. |
| 0:44–0:48 | Seven passing tests | Confirm the local checks. |
| 0:48–0:51.5 | End card | Close the demo. |

## Export check

- Duration below 3:00, in English or with accurate English subtitles.
- Actual Twitch chat and a card labeled `TWITCH` are visible; do not substitute the demo feed for this shot.
- OBS overlay and Codex use are visible.
- No copyrighted music, unauthorized footage, access tokens, or private information.
- The revised video was published to YouTube as **Public** on October 28, 2026. Add its URL to the Devpost submission.
