import { DEFAULT_PROFILE, normalizeProfile, ruleAnalyze } from './ai.mjs';

function words(text) { return new Set(String(text).toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || []); }
function similar(a, b) {
  const left = words(a), right = words(b);
  if (!left.size || !right.size) return false;
  return [...left].filter(word => right.has(word)).length / Math.max(left.size, right.size) >= 0.75;
}

export function createEngine(initialProfile = DEFAULT_PROFILE, analyze = ruleAnalyze) {
  let profile = normalizeProfile(initialProfile);
  let suggestions = [];
  let history = [];
  let activeId = null;
  let nextId = 1;
  let connection = { status: 'demo', channel: null, detail: 'Demo mode ready' };
  const snapshot = () => ({ profile: { ...profile }, suggestions: suggestions.map(x => ({ ...x, viewers: [...x.viewers] })), history: history.map(x => ({ ...x })), activeId, connection: { ...connection }, aiMode: process.env.AI_PROVIDER === 'ollama' ? 'Ollama with rule fallback' : 'Rules only' });

  function setProfile(input) {
    const next = normalizeProfile(input);
    if (activeId !== null && JSON.stringify(next) !== JSON.stringify(profile)) throw new Error('Finish the active mission before changing the stream profile.');
    if (JSON.stringify(next) !== JSON.stringify(profile)) {
      suggestions.forEach(item => { if (item.status === 'pending' || item.status === 'analyzing') item.status = 'stale'; });
    }
    profile = next;
    return snapshot();
  }

  function ingest(name, text, origin = 'twitch') {
    name = String(name || 'viewer').trim().slice(0, 30) || 'viewer';
    text = String(text || '').trim().slice(0, 220);
    if (text.length < 9) return { accepted: false, reason: 'Too short.' };
    const existing = suggestions.find(x => (x.status === 'pending' || x.status === 'analyzing') && similar(x.original, text));
    if (existing) {
      if (!existing.viewers.includes(name)) existing.viewers.push(name);
      if (origin === 'twitch') existing.origin = 'twitch';
      existing.repeats++;
      return { accepted: true, grouped: true, id: existing.id };
    }
    const item = { id: nextId++, name, viewers: [name], repeats: 1, original: text, title: '', reason: '', status: 'analyzing', mode: '', origin, createdAt: new Date().toISOString() };
    suggestions.unshift(item);
    suggestions = suggestions.slice(0, 60);
    Promise.resolve().then(() => analyze(text, { ...profile })).then(result => {
      if (item.status !== 'analyzing') return;
      item.mode = result.mode || 'unknown';
      item.reason = String(result.reason || '').slice(0, 220);
      item.title = String(result.title || '').slice(0, 100);
      item.status = result.accepted ? 'pending' : 'rejected';
    }).catch(error => { item.status = 'rejected'; item.reason = `Analysis failed: ${error.message}`; });
    return { accepted: true, grouped: false, id: item.id };
  }

  function act(id, action) {
    const item = suggestions.find(x => x.id === Number(id));
    if (!item) throw new Error('Suggestion not found.');
    if (action === 'approve') {
      if (item.status !== 'pending') throw new Error('Only reviewed suggestions can go on air.');
      if (activeId !== null) throw new Error('Finish the current challenge first.');
      item.status = 'active'; item.startedAt = new Date().toISOString(); item.durationMinutes = profile.minutes; activeId = item.id;
    } else if (action === 'skip') {
      if (item.status !== 'pending') throw new Error('Only pending suggestions can be skipped.');
      item.status = 'skipped';
    } else if (action === 'complete' || action === 'failed') {
      if (item.id !== activeId || item.status !== 'active') throw new Error('This challenge is not active.');
      item.status = action; item.endedAt = new Date().toISOString(); activeId = null;
      history.unshift({ id: item.id, title: item.title, status: action, viewers: [...item.viewers], endedAt: item.endedAt });
      history = history.slice(0, 30);
    } else throw new Error('Unknown action.');
    return snapshot();
  }
  function setConnection(next) { connection = { ...connection, ...next }; }
  return { snapshot, setProfile, ingest, act, setConnection };
}
