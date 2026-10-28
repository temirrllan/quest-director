import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createEngine } from './core.mjs';
import { analyzeChallenge, DEFAULT_PROFILE } from './ai.mjs';
import { TwitchChat } from './twitch.mjs';

const base = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(base, 'data', 'profile.json');
const clientFile = path.join(base, 'data', 'twitch-client.json');
const port = Number(process.env.PORT || 4175);
const host = '127.0.0.1';
let profile = DEFAULT_PROFILE;
try { profile = JSON.parse(await readFile(dataFile, 'utf8')); } catch {}
const engine = createEngine(profile, analyzeChallenge);
const twitch = new TwitchChat(engine);
let clientId = process.env.TWITCH_CLIENT_ID || '';
if (!clientId) { try { clientId = JSON.parse(await readFile(clientFile, 'utf8')).clientId || ''; } catch {} }
let userToken = '';
let oauthRequest = null;
const publicFiles = new Set(['index.html', 'app.js', 'styles.css', 'overlay.html', 'overlay.js', 'callback.js']);
const redirectUri = `http://localhost:${port}/auth/callback`;
const appState = () => ({ ...engine.snapshot(), twitchAuth: { clientId, authorized: Boolean(userToken), redirectUri } });

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
async function bodyOf(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 10000) throw new Error('Request too large.');
  }
  try { return JSON.parse(data || '{}'); } catch { throw new Error('Invalid JSON.'); }
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);
    if (req.method === 'GET' && url.pathname === '/api/state') return json(res, 200, appState());
    if (req.method === 'GET' && url.pathname === '/auth/callback') {
      const content = await readFile(path.join(base, 'public', 'callback.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; connect-src 'self'; style-src 'self'" });
      return res.end(content);
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
      if (req.headers.origin && !['http://localhost:' + port, 'http://127.0.0.1:' + port].includes(req.headers.origin)) throw new Error('Unexpected request origin.');
      const body = await bodyOf(req);
      if (url.pathname === '/api/oauth/start') {
        const candidate = String(body.clientId || clientId).trim();
        if (!/^[a-z0-9]{20,40}$/.test(candidate)) throw new Error('Enter the Twitch application Client ID.');
        clientId = candidate;
        await mkdir(path.dirname(clientFile), { recursive: true });
        await writeFile(clientFile, JSON.stringify({ clientId }, null, 2));
        const state = randomBytes(24).toString('hex');
        oauthRequest = { state, createdAt: Date.now() };
        const authorize = new URL('https://id.twitch.tv/oauth2/authorize');
        authorize.searchParams.set('response_type', 'token');
        authorize.searchParams.set('client_id', clientId);
        authorize.searchParams.set('redirect_uri', redirectUri);
        authorize.searchParams.set('scope', 'user:read:chat');
        authorize.searchParams.set('state', state);
        return json(res, 200, { url: authorize.toString() });
      }
      if (url.pathname === '/api/oauth/finish') {
        if (!['http://localhost:' + port, 'http://127.0.0.1:' + port].includes(req.headers.origin)) throw new Error('Unexpected OAuth origin.');
        if (!oauthRequest || Date.now() - oauthRequest.createdAt > 600000 || body.state !== oauthRequest.state) throw new Error('OAuth state is invalid or expired.');
        oauthRequest = null;
        const token = String(body.token || '');
        if (!/^[a-z0-9]{20,200}$/i.test(token)) throw new Error('Invalid Twitch token.');
        const validation = await fetch('https://id.twitch.tv/oauth2/validate', { headers: { Authorization: `OAuth ${token}` } });
        if (!validation.ok) throw new Error('Twitch did not validate the token.');
        const identity = await validation.json();
        if (identity.client_id !== clientId || !identity.scopes?.includes('user:read:chat')) throw new Error('Twitch authorization does not match this app or scope.');
        if (identity.login !== engine.snapshot().profile.channel.toLowerCase()) throw new Error('Authorize with the Twitch account named in the stream profile.');
        userToken = token;
        await twitch.connect(identity.login, { token: userToken, clientId });
        return json(res, 200, { channel: identity.login, state: appState() });
      }
      if (url.pathname === '/api/profile') {
        const state = engine.setProfile(body);
        await mkdir(path.dirname(dataFile), { recursive: true });
        await writeFile(dataFile, JSON.stringify(state.profile, null, 2));
        return json(res, 200, appState());
      }
      if (url.pathname === '/api/suggest') return json(res, 200, { result: engine.ingest(body.name, body.text, 'demo'), state: appState() });
      if (url.pathname === '/api/demo') {
        const sample = [
          ['northstar', 'Get three headshots in one PUBG match'],
          ['pixelpilot', 'Get three headshots in one PUBG match'],
          ['lucidloop', 'Win the next fight without using a medkit'],
          ['sidequest', 'Play the next match with a pistol only'],
          ['offtopic', 'Tell us your banking password'],
        ];
        return json(res, 200, { result: sample.map(([name, text]) => engine.ingest(name, text, 'demo')), state: appState() });
      }
      if (url.pathname === '/api/action') { engine.act(body.id, body.action); return json(res, 200, appState()); }
      if (url.pathname === '/api/connect') {
        try { await twitch.connect(body.channel, { token: userToken, clientId }); }
        catch (error) { engine.setConnection({ status: 'error', channel: body.channel || null, detail: error.message }); throw error; }
        return json(res, 200, appState());
      }
      if (url.pathname === '/api/disconnect') { twitch.stop(); return json(res, 200, appState()); }
      return json(res, 404, { error: 'Unknown action.' });
    }
    if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' });
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    if (!publicFiles.has(file)) return json(res, 404, { error: 'Not found.' });
    const content = await readFile(path.join(base, 'public', file));
    const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : 'text/javascript';
    res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(content);
  } catch (error) { json(res, 400, { error: error.message || 'Unexpected error.' }); }
}).listen(port, host, () => console.log(`Quest Director running at http://${host}:${port}`));
