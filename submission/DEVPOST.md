# Quest Director — Devpost submission

## One-line pitch

Turn Twitch chat suggestions into game-specific on-stream challenges, with the streamer in control of every mission.

## Inspiration

Streamers want viewers to influence what happens live, but a busy chat can produce too many repetitive, irrelevant, or unsuitable suggestions to read while playing. Quest Director turns that flow into a manageable queue and a clear on-screen objective.

## What it does

The streamer sets the game, style, difficulty, forbidden challenge types, and time limit. Viewers suggest challenges in Twitch chat. Quest Director reads chat through Twitch EventSub, groups repeated ideas, checks each idea against the stream profile, and optionally uses a local language model to turn a valid idea into a short mission. The streamer approves a mission before it appears in an OBS overlay, then marks it complete or missed. A built-in demo feed lets anyone rehearse the full loop without a Twitch account.

## How we built it

The application uses Node.js without runtime packages, Twitch OAuth with the `user:read:chat` scope, Twitch EventSub WebSockets, and a browser source in OBS. Its optional AI mode calls a local Ollama model for relevance checks and mission wording. When the model is unavailable, a clearly labeled rules filter handles supported profiles. The local server keeps the Twitch access token in memory and never includes it in the repository.

I used OpenAI Codex in session `01a17eb0-74ff-76e3-8410-200707749db4` to design and implement the challenge pipeline, Twitch integration, stream dashboard, OBS overlay, and tests. Codex also helped test the live chat flow and refine the model prompt after an in-game driving challenge was incorrectly treated as a real-world safety issue.

## Challenges and learning

The hardest part was keeping viewer input useful without letting it take control of the stream. Chat messages are treated as untrusted suggestions. The streamer makes the final approval and outcome decisions. Testing with a real Twitch message exposed a model classification error; explicit game context fixed that example. This is a working prototype, not a claim that every game or suggestion has been validated.

## What's next

Add streamer-defined challenge templates for more games, better moderation controls, and richer overlays. Game outcomes are currently marked by the streamer; automatic game-state verification is outside this version.

## Submission links

- Repository URL: https://github.com/temirrllan/quest-director
- Submitted project: https://devpost.com/software/quest-director
- Public YouTube demo URL: https://youtu.be/zrnfwS6Rb74
- Codex session ID: `01a17eb0-74ff-76e3-8410-200707749db4`
- Demo recording: local recording, no public Twitch broadcast
- The submission video labels the example game as `[game]` to avoid an unlicensed third-party mark. The chat delivery, app workflow, and Codex footage are otherwise the recorded demo.
