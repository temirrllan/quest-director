# English narration for the local review cut

Voice: Kokoro `am_michael`. The original 47.5-second edit shortened static holds from the 75-second original. The published 51.5-second revision adds Codex build evidence and corrects the recorded filter mode. Both scripts describe the recorded offline Twitch test and do not imply a public broadcast or independent viewer participation.

| Time | Spoken line |
| --- | --- |
| 0:00 | Quest Director. Make chat part of the game. |
| 0:04 | I posted a labeled test challenge in my real Twitch chat while the channel was offline. |
| 0:11 | Twitch EventSub delivered it. Local AI checked the PUBG profile and queued it for review. |
| 0:19 | My approval put the mission on the OBS overlay. The streamer controls what appears on air. |
| 0:26 | I marked this test as missed. Gameplay results are not automatically verified. |
| 0:33 | I built the Twitch connection, challenge pipeline, dashboard, and OBS overlay with Codex. |
| 0:40 | Seven automated tests pass. |
| 0:44 | Quest Director. Chat shapes the show. |

Generate the revised voice track with `narration.py --tight`, then run `make_tight_cut.py` to assemble the shorter copy. Source model: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0. ONNX wrapper: [thewh1teagle/kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx), MIT. The model and voice files are stored under the ignored `recordings/` folder.

## Codex build evidence revision (51.5-second review cut)

The first 32.5 seconds retain the functional demo, with its caption and narration corrected to identify the rule fallback actually visible in this recording. At 32.5 seconds the video shows an English translation of the user's original game-specific challenge brief. At 37 seconds it lists the files added in the original Codex build turn (`ai.mjs`, `core.mjs`, `server.mjs`, `public/app.js`, `public/overlay.js`) alongside a genuine later Codex editor recording. The recording's unrelated chat history, OBS preview, and later documentation diff are masked. A test card and end card follow. The original build turn also ran `node --check` and `npm test`; all seven current tests pass.

Generate with `narration.py --codex-revision` and `make_codex_revision.py`. The output is `recordings/quest-director-demo-codex-revision.mp4`. This revision is [published on YouTube](https://youtu.be/ZURa0R4VPwc).
