Quest Director turns real Twitch chat suggestions into game-specific on-stream challenges. The streamer approves every mission before it appears in an OBS overlay and marks the outcome.

Source code and setup: https://github.com/temirrllan/quest-director

What this 51-second demo shows:
00:00 — Project overview
00:04 — A clearly labeled test idea in the real #tem1rrllan Twitch chat (channel offline)
00:11 — Twitch EventSub delivers the idea; the local rules filter checks the game profile
00:19 — Streamer approval sends the mission to the OBS overlay
00:26 — The streamer marks the outcome
00:32 — Original request to Codex, translated from Russian
00:37 — Original Codex build activity from the session log, with later Codex editor footage
00:44 — Seven passing automated tests

Run it locally:
1. Install Node.js 22 or newer.
2. Clone https://github.com/temirrllan/quest-director
3. Run npm test && npm start in the project folder.
4. Open http://localhost:4175/ for the dashboard.
5. Use http://localhost:4175/overlay.html as an OBS Browser Source.

The recorded run used the rules filter. Optional local AI via Ollama can check relevance and rewrite suggestions. The app reads chat with Twitch OAuth scope user:read:chat. The streamer always approves missions and manually marks outcomes; gameplay results are not automatically verified.

Built with OpenAI Codex for Codex x TwitchCon 2026.
Codex session ID: 01a17eb0-74ff-76e3-8410-200707749db4
No public Twitch broadcast was started for this recording.
