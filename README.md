# Quest Director

An interactive Twitch challenge director built with Codex during the Codex x TwitchCon 2026 submission period. Viewers suggest challenges in chat. The app filters and rewrites ideas for the streamer's selected game, and the streamer approves each on-air mission. The overlay shows the active mission. The streamer marks its outcome.

**Public demo video:** [Quest Director — Twitch Chat Challenges with AI](https://youtu.be/qWdyoRSuWkc) (47.5 seconds).

## Start locally

Node.js 22 or newer is required. No dependencies or paid API key are needed for the rules-only rehearsal.

```bash
cd quest-director
npm test
npm start
```

Open `http://127.0.0.1:4175/`. Click **Load sample chat**, approve a challenge, and use **Completed** or **Not completed**. The transparent OBS browser source is `http://127.0.0.1:4175/overlay.html`.

## AI mode

By default, the app uses a transparent rule filter. It labels this mode **Rules only**; it does not claim to have used an AI model. To enable local AI rewriting and relevance checks with Ollama:

```bash
ollama pull qwen2.5:7b-instruct
export AI_PROVIDER=ollama
export OLLAMA_MODEL=qwen2.5:7b-instruct
npm start
```

The app calls Ollama's local `/api/generate` endpoint with JSON output. If the model is unavailable or takes longer than ten seconds, the app falls back to the rule filter and labels the result `rules-fallback`. Chat text is untrusted input; a streamer must approve every on-air challenge. On October 28, the local `qwen2.5:7b-instruct` model accepted a PUBG headshot task and a Rocket League no-boost goal in real API checks. This is an initial check, not broad quality validation.

## Connect Twitch

Create a **Public** application in the [Twitch Developer Console](https://dev.twitch.tv/console/apps), select **Chat Bot**, and register `http://localhost:4175/auth/callback` as its OAuth Redirect URL. Twitch permits `http://localhost` for local testing. Copy the public Client ID into the dashboard and click **Authorize chat access**. The requested scope is only `user:read:chat`; the app reads messages but cannot send them or moderate chat. After Twitch redirects back, the app connects to the channel in your stream profile. You can also enter another channel and click **Connect**.

The access token is validated with Twitch and kept only in the local server process memory. It is never written to disk or the repository. The public Client ID is saved in ignored `data/twitch-client.json`. Restarting the app requires authorizing again. The OAuth flow uses [Twitch's authentication guide](https://dev.twitch.tv/docs/chat/authenticating/) and EventSub WebSockets. On October 28, a message posted in `#tem1rrllan` reached the queue through EventSub, was accepted by the local AI, and appeared in the overlay after streamer approval.

## Current scope

- The profile stores a game/format, style, difficulty, forbidden phrases, and challenge duration locally in `data/profile.json`.
- Changing the profile retires the old pending queue. An active mission must be finished first.
- The sample profile is PUBG. The rules-only filter covers PUBG, Minecraft, and Just Chatting; arbitrary game profiles need AI mode or additional game rules. AI mode can review suggestions that do not literally name the game.
- Duplicate suggestions are grouped. Unrelated and unsafe ideas are rejected. The streamer approves, skips, completes, or fails a challenge.
- The overlay shows only the streamer's approved challenge, never raw chat.
- Game achievements are **not** automatically verified. The streamer marks the outcome.
- Broader model quality remains untested. The overlay has been verified in an OBS Browser Source. A 47.5-second local review video shows the real Twitch chat test, the streamer approval flow, the OBS overlay, and a Codex build clip. The channel was offline throughout; no public stream was started.

## Hackathon materials

The English [submission copy](submission/DEVPOST.md) and [demo plan](submission/DEMO.md) are in `submission/`. The [public YouTube demo](https://youtu.be/qWdyoRSuWkc) is the 47.5-second cut with English captions and voiceover. Its local source file is `submission/recordings/quest-director-demo-tight.mp4` (ignored by Git). The original 75-second voiced cut and silent cut remain under `submission/recordings/` for comparison. The Devpost submission remains a separate step. The Codex session ID for this build is `01a17eb0-74ff-76e3-8410-200707749db4`.
