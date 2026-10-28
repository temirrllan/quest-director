const EVENTSUB_URL = 'wss://eventsub.wss.twitch.tv/ws';
const API = 'https://api.twitch.tv/helix';

export class TwitchChat {
  constructor(engine) {
    this.engine = engine;
    this.socket = null;
    this.channel = null;
    this.retries = 0;
    this.stopped = true;
  }

  async connect(channel, credentials = {}) {
    const clean = String(channel ?? '').trim().replace(/^@/, '').toLowerCase();
    if (!/^[a-z0-9_]{4,25}$/.test(clean)) throw new Error('Enter a Twitch channel name.');
    const token = credentials.token || process.env.TWITCH_USER_TOKEN;
    const clientId = credentials.clientId || process.env.TWITCH_CLIENT_ID;
    if (!token || !clientId) {
      throw new Error('Set TWITCH_USER_TOKEN and TWITCH_CLIENT_ID before connecting.');
    }
    this.stop();
    this.stopped = false;
    this.channel = clean;
    this.engine.setConnection({ status: 'connecting', channel: clean, detail: 'Checking Twitch access…' });

    const auth = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: `OAuth ${token}` },
    });
    if (!auth.ok) throw new Error('Twitch token is invalid or expired.');
    const identity = await auth.json();
    if (identity.client_id !== clientId) throw new Error('Client ID does not match Twitch token.');
    if (!identity.scopes?.includes('user:read:chat')) {
      throw new Error('Twitch token needs the user:read:chat scope.');
    }

    const userResponse = await fetch(`${API}/users?login=${encodeURIComponent(clean)}`, {
      headers: { Authorization: `Bearer ${token}`, 'Client-Id': clientId },
    });
    if (!userResponse.ok) throw new Error('Could not look up Twitch channel.');
    const channelUser = (await userResponse.json()).data?.[0];
    if (!channelUser) throw new Error('Twitch channel was not found.');
    this.broadcasterId = channelUser.id;
    this.token = token;
    this.clientId = clientId;
    this.userId = identity.user_id;
    this.openSocket();
  }

  openSocket(url = EVENTSUB_URL, preservingSession = false) {
    if (this.stopped) return;
    const previousSocket = this.socket;
    const socket = new WebSocket(url);
    this.socket = socket;
    this.engine.setConnection({ status: 'connecting', channel: this.channel, detail: 'Connecting to Twitch chat…' });
    socket.addEventListener('message', async event => {
      if (this.stopped || this.socket !== socket) return;
      let packet;
      try { packet = JSON.parse(event.data); } catch { return; }
      const type = packet.metadata?.message_type;
      if (type === 'session_welcome') {
        try {
          if (!preservingSession) await this.subscribe(packet.payload.session.id);
          if (this.stopped || this.socket !== socket) return;
          previousSocket?.close();
          this.retries = 0;
          this.engine.setConnection({ status: 'live', channel: this.channel, detail: `Listening to #${this.channel}` });
        } catch (error) {
          this.engine.setConnection({ status: 'error', channel: this.channel, detail: error.message });
          this.stop();
          this.engine.setConnection({ status: 'error', channel: this.channel, detail: error.message });
        }
      } else if (type === 'notification' && packet.payload?.subscription?.type === 'channel.chat.message') {
        const chat = packet.payload.event;
        this.engine.ingest(chat.chatter_user_name, chat.message?.text, 'twitch');
      } else if (type === 'session_reconnect') {
        // The reconnect URL keeps the existing subscription alive.
        this.openSocket(packet.payload.session.reconnect_url, true);
      }
    });
    socket.addEventListener('error', () => {
      this.engine.setConnection({ status: 'error', channel: this.channel, detail: 'Twitch connection failed.' });
    });
    socket.addEventListener('close', () => {
      if (this.stopped || this.socket !== socket) return;
      previousSocket?.close();
      this.engine.setConnection({ status: 'connecting', channel: this.channel, detail: 'Reconnecting to Twitch…' });
      const delay = Math.min(30000, 1000 * 2 ** Math.min(this.retries++, 5));
      setTimeout(() => {
        if (!this.stopped && this.socket === socket) this.openSocket();
      }, delay);
    });
  }

  async subscribe(sessionId) {
    const response = await fetch(`${API}/eventsub/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Client-Id': this.clientId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'channel.chat.message',
        version: '1',
        condition: { broadcaster_user_id: this.broadcasterId, user_id: this.userId },
        transport: { method: 'websocket', session_id: sessionId },
      }),
    });
    if (response.status !== 202) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `Twitch subscription failed (${response.status}).`);
    }
  }

  stop() {
    this.stopped = true;
    this.socket?.close();
    this.socket = null;
    this.engine.setConnection({ status: 'demo', channel: null, detail: 'Demo mode is ready' });
  }
}
