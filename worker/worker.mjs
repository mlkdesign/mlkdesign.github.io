const ORIGIN = 'https://mlkdesign.github.io';
const FORMSPREE = 'https://formspree.io/f/meaajpvl';
const MAX_BODY = 16384;

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new Error('large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Origin',
      ...(origin === ORIGIN ? { 'Access-Control-Allow-Origin': ORIGIN } : {}),
    };
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/health') {
      return reply(200, { service: 'mlk-studio-requests', turnstileConfigured: Boolean(env.TURNSTILE_SECRET), telegramConfigured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) });
    }
    if (path !== '/submit') return reply(404, { error: 'not_found' });
    if (origin !== ORIGIN) return reply(403, { error: 'origin' });
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } });
    }
    if (request.method !== 'POST') return reply(405, { error: 'method' });
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415, { error: 'content_type' });
    if (Number(request.headers.get('Content-Length')) > MAX_BODY) return reply(413, { error: 'too_large' });
    let data;
    try { data = await readBody(request); } catch (error) { return reply(error.message === 'large' ? 413 : 400, { error: 'body' }); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, { error: 'body' });
    if (data.website) return reply(400, { error: 'validation' });
    const text = (key) => typeof data[key] === 'string' ? data[key].trim() : '';
    const name = text('name'), email = text('email'), details = text('details'), token = text('token');
    const emailParts = email.split('@');
    if (!name || name.length > 120 || Array.from(name).some(c => c.charCodeAt(0) < 32) || email.length > 254 || emailParts.length !== 2 || !emailParts[0] || !emailParts[1].includes('.') || emailParts[1].startsWith('.') || emailParts[1].endsWith('.') || Array.from(email).some(c => c.trim() === '' || c.charCodeAt(0) < 32) || details.length < 10 || details.length > 2500 || Array.from(details).some(c => c.charCodeAt(0) < 32 && ![9, 10, 13].includes(c.charCodeAt(0))) || !token || token.length > 2048) {
      return reply(400, { error: 'validation' });
    }
    if (!env.TURNSTILE_SECRET) return reply(503, { error: 'not_configured' });
    if (env.REQUEST_LIMITER) {
      const { success } = await env.REQUEST_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
      if (!success) return reply(429, { error: 'rate_limit' });
    }
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: request.headers.get('CF-Connecting-IP') || '' }), signal: AbortSignal.timeout(8000),
      });
      if (!verification.ok) return reply(503, { error: 'verification_unavailable' });
      const check = await verification.json();
      if (!check.success || check.hostname !== 'mlkdesign.github.io' || check.action !== 'project_request') return reply(403, { error: 'verification' });
    } catch { return reply(503, { error: 'verification_unavailable' }); }
    const id = crypto.randomUUID();
    try {
      const delivery = await fetch(FORMSPREE, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, details, _subject: 'New project request from MLK.STUDIO', request_id: id }), signal: AbortSignal.timeout(8000),
      });
      const result = await delivery.json().catch(() => null);
      if (!delivery.ok || !result || result.ok !== true || result.errors?.length) return reply(502, { error: 'delivery' });
    } catch { return reply(502, { error: 'delivery' }); }
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      ctx.waitUntil((async () => {
        try {
          const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `MLK.STUDIO — new request\n\nName: ${name}\nEmail: ${email}\n\n${details}\n\nID: ${id}`, link_preview_options: { is_disabled: true } }), signal: AbortSignal.timeout(8000),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            const description = String(result.description || '').toLowerCase();
            const reason = description.includes('chat not found') ? 'chat_not_found'
              : description.includes('blocked') ? 'bot_blocked'
              : description.includes('initiate conversation') ? 'start_required'
              : response.status === 401 ? 'invalid_token'
              : response.status === 404 ? 'invalid_token_or_endpoint'
              : response.status === 429 ? 'rate_limited' : 'telegram_error';
            console.error('telegram_delivery_failed', { requestId: id, status: response.status, errorCode: result.error_code, reason });
          }
        } catch { console.error('telegram_delivery_failed', { requestId: id }); }
      })());
    }
    return reply(200, { ok: true, requestId: id });
  },
};
