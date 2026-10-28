const card = document.getElementById('overlay');
const title = document.getElementById('overlay-title');
const viewers = document.getElementById('overlay-viewers');
const time = document.getElementById('overlay-time');
async function update() {
  try {
    const state = await (await fetch('/api/state')).json();
    const active = state.suggestions.find(x => x.id === state.activeId);
    card.hidden = !active;
    if (!active) return;
    title.textContent = active.title;
    viewers.textContent = `Suggested by ${active.viewers.slice(0, 3).join(', ')}${active.viewers.length > 3 ? ` +${active.viewers.length - 3}` : ''}`;
    const seconds = Math.max(0, Math.ceil((Date.parse(active.startedAt) + active.durationMinutes * 60000 - Date.now()) / 1000));
    time.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  } catch { card.hidden = true; }
}
update(); setInterval(update, 1000);
