# English narration for the local review cut

Voice: Kokoro `am_michael`. The script describes the recorded offline Twitch test and does not imply a public broadcast or independent viewer participation.

| Time | Spoken line |
| --- | --- |
| 0:00 | Quest Director. Make chat part of the game. |
| 0:04 | I posted a labeled test challenge in my real Twitch chat while the channel was offline. |
| 0:19 | EventSub delivered it. Local AI checked the PUBG profile and queued it for review. |
| 0:30 | My approval put the mission on the OBS overlay. The streamer controls what appears on air. |
| 0:42 | I marked this test as missed. Gameplay results are not automatically verified. |
| 0:55 | I built the Twitch connection, challenge pipeline, dashboard, and overlay with Codex. |
| 1:04 | Seven automated tests pass. |
| 1:12 | Quest Director. Chat shapes the show. |

Generate the voice track with `narration.py`, then mux it into a **copy** of the silent video. Source model: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0. ONNX wrapper: [thewh1teagle/kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx), MIT. The model and voice files are stored under the ignored `recordings/` folder.
