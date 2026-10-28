const $ = id => document.getElementById(id);
let state;
let profileLoaded = false;
const el = (tag, className, content) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
};
function notice(message, bad = false) { $('notice').textContent = message; $('notice').classList.toggle('bad', bad); }
async function api(path, data) {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed.');
  return body;
}
async function act(id, action) {
  try { state = await api('/api/action', { id, action }); render(); notice(action === 'approve' ? 'Mission is on air.' : 'Challenge updated.'); }
  catch (error) { notice(error.message, true); }
}
function button(label, action, id, secondary = false) {
  const node = el('button', secondary ? 'secondary' : '', label);
  node.type = 'button'; node.addEventListener('click', () => act(id, action)); return node;
}
function renderQueue() {
  const queue = $('queue'); queue.replaceChildren();
  const items = state.suggestions.filter(x => x.status === 'pending' || x.status === 'analyzing');
  $('queue-count').textContent = `${items.filter(x => x.status === 'pending').length} READY`;
  if (!items.length) { queue.append(el('p', 'empty', 'Waiting for chat suggestions.')); return; }
  for (const item of items) {
    const card = el('article', 'quest');
    const top = el('div', 'quest-top'); top.append(el('span', 'source', item.origin.toUpperCase()), el('span', 'quest-id', `#${item.id}`)); card.append(top);
    card.append(el('h3', '', item.status === 'analyzing' ? 'Reviewing suggestion…' : item.title));
    card.append(el('p', 'original', `“${item.original}”`));
    card.append(el('p', 'meta', `${item.viewers.join(', ')}${item.repeats > 1 ? ` · ${item.repeats} suggestions` : ''}`));
    if (item.reason) card.append(el('p', 'reason', item.reason));
    if (item.status === 'pending') { const actions = el('div', 'quest-actions'); actions.append(button('Put on air ↗', 'approve', item.id), button('Skip', 'skip', item.id, true)); card.append(actions); }
    queue.append(card);
  }
}
function renderActive() {
  const box = $('active'); box.replaceChildren();
  const item = state.suggestions.find(x => x.id === state.activeId);
  if (!item) { box.className = 'empty'; box.textContent = 'Approve a challenge to put it on air.'; return; }
  box.className = 'active-card'; box.append(el('p', 'eyebrow', 'MISSION IN PROGRESS'), el('h3', '', item.title), el('p', 'meta', `Suggested by ${item.viewers.join(', ')}`));
  const actions = el('div', 'quest-actions'); actions.append(button('Completed ✓', 'complete', item.id), button('Not completed', 'failed', item.id, true)); box.append(actions);
}
function renderHistory() {
  const list = $('history'); list.replaceChildren();
  if (!state.history.length) { list.append(el('span', '', 'No results yet.')); return; }
  for (const item of state.history.slice(0, 8)) {
    const row = el('div', 'history-item'); row.append(el('span', '', item.title), el('strong', item.status === 'complete' ? 'COMPLETED' : 'MISSED')); list.append(row);
  }
}
function render() {
  $('ai-mode').textContent = state.aiMode.toUpperCase();
  $('connection-pill').textContent = state.connection.status === 'live' ? `LIVE #${state.connection.channel}` : state.connection.status === 'connecting' ? 'CONNECTING' : 'DEMO MODE';
  $('connection-pill').classList.toggle('live', state.connection.status === 'live');
  $('connection-detail').textContent = state.connection.detail;
  $('auth-detail').textContent = state.twitchAuth.authorized ? 'Chat access authorized for this local session.' : 'Chat access not authorized yet.';
  $('redirect-url').textContent = state.twitchAuth.redirectUri;
  if (!profileLoaded) {
    for (const key of ['channel', 'game', 'style', 'difficulty', 'forbidden', 'minutes']) $(key).value = state.profile[key];
    $('client-id').value = state.twitchAuth.clientId;
    profileLoaded = true;
  }
  renderQueue(); renderActive(); renderHistory();
}
async function refresh() { try { state = await (await fetch('/api/state')).json(); render(); } catch { notice('Local server disconnected.', true); } }

$('profile-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    state = await api('/api/profile', Object.fromEntries(['channel', 'game', 'style', 'difficulty', 'forbidden', 'minutes'].map(id => [id, $(id).value])));
    render(); notice('Stream profile saved. New suggestions will use it.');
  } catch (error) { notice(error.message, true); }
});
$('suggest-form').addEventListener('submit', async event => {
  event.preventDefault();
  try { await api('/api/suggest', { name: $('viewer').value, text: $('message').value }); $('message').value = ''; await refresh(); notice('Suggestion sent for review.'); }
  catch (error) { notice(error.message, true); }
});
$('demo').addEventListener('click', async () => { try { await api('/api/demo', {}); await refresh(); notice('Sample chat loaded.'); } catch (error) { notice(error.message, true); } });
$('auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  try { const result = await api('/api/oauth/start', { clientId: $('client-id').value }); location.assign(result.url); }
  catch (error) { notice(error.message, true); }
});
$('connect-form').addEventListener('submit', async event => {
  event.preventDefault();
  try { state = await api('/api/connect', { channel: $('channel').value }); render(); notice('Connecting to Twitch chat.'); }
  catch (error) { notice(error.message, true); await refresh(); }
});
$('disconnect').addEventListener('click', async () => { try { state = await api('/api/disconnect', {}); render(); notice('Twitch disconnected.'); } catch (error) { notice(error.message, true); } });
refresh(); setInterval(refresh, 1000);
