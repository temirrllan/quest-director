import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../core.mjs';
import { ruleAnalyze, normalizeProfile, analyzeChallenge } from '../ai.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));

test('PUBG profile accepts a game challenge and rejects an unrelated idea', () => {
  const profile = normalizeProfile({ game: 'PUBG' });
  assert.equal(ruleAnalyze('Get three headshots this match', profile).accepted, true);
  assert.equal(ruleAnalyze('Win the next fight without using a medkit', profile).accepted, true);
  assert.equal(ruleAnalyze('Play the next match with a pistol only', profile).accepted, true);
  assert.equal(ruleAnalyze('Tell a story about your school', profile).accepted, false);
});

test('streamer forbidden list overrides an otherwise relevant challenge', () => {
  const profile = normalizeProfile({ game: 'PUBG', forbidden: 'headshots, harassment' });
  assert.equal(ruleAnalyze('Get three headshots this match', profile).accepted, false);
});

test('viewer ideas remain private until streamer approves, then reach a result', async () => {
  const engine = createEngine();
  const first = engine.ingest('alice', 'Get three headshots this match', 'twitch');
  await tick();
  assert.equal(engine.snapshot().activeId, null);
  assert.equal(engine.snapshot().suggestions[0].status, 'pending');
  assert.equal(engine.ingest('bob', 'Get three headshots this match', 'twitch').grouped, true);
  assert.equal(engine.snapshot().suggestions[0].viewers.length, 2);
  engine.act(first.id, 'approve');
  assert.equal(engine.snapshot().activeId, first.id);
  engine.act(first.id, 'complete');
  assert.equal(engine.snapshot().activeId, null);
  assert.equal(engine.snapshot().history[0].status, 'complete');
});

test('cannot approve a rejected challenge or replace an active one', async () => {
  const engine = createEngine();
  const bad = engine.ingest('alice', 'Show your banking password on stream', 'demo');
  const good = engine.ingest('bob', 'Win the next PUBG match without a medkit', 'demo');
  await tick();
  assert.throws(() => engine.act(bad.id, 'approve'));
  engine.act(good.id, 'approve');
  const another = engine.ingest('charlie', 'Get three headshots in one match', 'demo');
  await tick();
  assert.throws(() => engine.act(another.id, 'approve'));
});

test('AI mode can adapt a suggestion to a custom game profile', async () => {
  const oldProvider = process.env.AI_PROVIDER;
  const oldFetch = globalThis.fetch;
  process.env.AI_PROVIDER = 'ollama';
  globalThis.fetch = async (_url, request) => {
    const payload = JSON.parse(request.body);
    assert.match(payload.prompt, /Rocket League/);
    assert.match(payload.prompt, /medium/);
    return { ok: true, json: async () => ({ response: JSON.stringify({ accepted: true, title: 'Score one goal without using boost', reason: 'Fits the selected match.' }) }) };
  };
  try {
    const profile = normalizeProfile({ game: 'Rocket League', forbidden: 'demo phrase' });
    const result = await analyzeChallenge('Score one goal without using boost', profile);
    assert.equal(result.accepted, true);
    assert.equal(result.mode, 'ollama');
  } finally {
    globalThis.fetch = oldFetch;
    if (oldProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = oldProvider;
  }
});

test('switching games retires the previous game queue', async () => {
  const engine = createEngine();
  const old = engine.ingest('alice', 'Get three headshots this match', 'demo');
  await tick();
  engine.setProfile({ game: 'Rocket League' });
  assert.equal(engine.snapshot().suggestions.find(x => x.id === old.id).status, 'stale');
  assert.throws(() => engine.act(old.id, 'approve'));
});

test('a live Twitch repeat is visibly sourced from Twitch even after demo rehearsal', async () => {
  const engine = createEngine();
  engine.ingest('demo_viewer', 'Get three headshots in one PUBG match', 'demo');
  await tick();
  engine.ingest('live_viewer', 'Get three headshots in one PUBG match', 'twitch');
  const item = engine.snapshot().suggestions[0];
  assert.equal(item.origin, 'twitch');
  assert.deepEqual(item.viewers, ['demo_viewer', 'live_viewer']);
});
