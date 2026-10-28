const result = document.getElementById('oauth-result');
const params = new URLSearchParams(location.hash.slice(1));
const query = new URLSearchParams(location.search);
history.replaceState(null, '', '/auth/callback');
if (query.get('error')) result.textContent = `Twitch authorization was declined: ${query.get('error_description') || query.get('error')}`;
else if (!params.get('access_token') || !params.get('state')) result.textContent = 'No Twitch token was returned.';
else {
  try {
    const response = await fetch('/api/oauth/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: params.get('access_token'), state: params.get('state') }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Authorization failed.');
    result.textContent = `Connected to #${data.channel}. You can return to the dashboard.`;
  } catch (error) { result.textContent = `Connection failed: ${error.message}`; }
}
