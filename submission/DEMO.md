# Local demo plan (under 3 minutes)

The [public demo video](https://youtu.be/qWdyoRSuWkc) shows the project working with Twitch and shows Codex use. It was recorded locally in OBS without starting a Twitch broadcast, using the real `tem1rrllan` channel chat while the channel was offline.

## Current local review cut

`recordings/quest-director-demo-tight.mp4` is the current 47.5-second, 1280×720 review cut with English captions and a local Kokoro voiceover. It shortens the static holds in the original 75-second voiced cut. `recordings/quest-director-demo.mp4` is the original silent version. The video shows a labeled test message in the real Twitch chat, the Twitch-sourced approval card, the OBS mission overlay, a masked Codex window showing project code, and the seven passing test cases. The mask hides unrelated private chat history in the Codex window. The Twitch channel remained offline. The raw OBS recordings are in the same ignored `recordings/` directory. `make_cards.py` generates the title cards and caption graphics; `narration.py --tight` generates the revised voice track; `make_tight_cut.py` assembles the video. The script is in `NARRATION.md`.

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
| 0:33–0:40 | Codex title and masked workspace clip | Explain what was built with Codex. |
| 0:40–0:44 | Seven passing tests | Confirm the local checks. |
| 0:44–0:47.5 | End card | Close the demo. |

## Export check

- Duration below 3:00, in English or with accurate English subtitles.
- Actual Twitch chat and a card labeled `TWITCH` are visible; do not substitute the demo feed for this shot.
- OBS overlay and Codex use are visible.
- No copyrighted music, unauthorized footage, access tokens, or private information.
- The finished video was published to YouTube as **Public** on October 28, 2026. Add its URL to the Devpost submission.
