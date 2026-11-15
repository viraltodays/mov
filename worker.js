const VIDEO_PREFIX = 'video:';
const ALLOWED_HOSTS = new Set(['cdn2.videy.co', 'cdn.slicedrv.com']);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function cleanCode(value) { return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80); }
function validateVideoUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && !url.username && !url.password && ALLOWED_HOSTS.has(url.hostname) ? url.href : null;
  } catch { return null; }
}
function authorized(request, env) { return Boolean(env.ADMIN_PASSWORD && request.headers.get('authorization') === `Bearer ${env.ADMIN_PASSWORD}`); }
async function getAllVideos(kv) {
  const videos = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: VIDEO_PREFIX, cursor, limit: 1000 });
    const values = await Promise.all(page.keys.map((key) => kv.get(key.name, 'json')));
    videos.push(...values.filter(Boolean));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return videos.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}
async function api(request, env, url) {
  if (!env.VIDEOS) return json({ error: 'The VIDEOS KV binding is not configured.' }, 500);
  if (url.pathname === '/api/videos' && request.method === 'GET') return json(await getAllVideos(env.VIDEOS));
  if (url.pathname === '/api/videos' && request.method === 'POST') {
    if (!authorized(request, env)) return json({ error: 'Admin password is missing or incorrect.' }, 401);
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Request must contain valid JSON.' }, 400); }
    const code = cleanCode(body.code);
    const title = String(body.title || '').trim().slice(0, 160);
    const videoUrl = validateVideoUrl(body.url);
    if (!code || !title || !videoUrl) return json({ error: 'Enter a code, title, and HTTPS URL from cdn2.videy.co or cdn.slicedrv.com.' }, 400);
    const key = VIDEO_PREFIX + code.toLowerCase();
    const prior = await env.VIDEOS.get(key, 'json');
    const record = { code, title, url: videoUrl, createdAt: prior?.createdAt || new Date().toISOString() };
    await env.VIDEOS.put(key, JSON.stringify(record));
    return json(record, prior ? 200 : 201);
  }
  const match = url.pathname.match(/^\/api\/videos\/([^/]+)$/);
  if (match && request.method === 'GET') {
    const code = cleanCode(decodeURIComponent(match[1]));
    const video = await env.VIDEOS.get(VIDEO_PREFIX + code.toLowerCase(), 'json');
    return video ? json(video) : json({ error: 'Video not found.' }, 404);
  }
  if (match && request.method === 'DELETE') {
    if (!authorized(request, env)) return json({ error: 'Admin password is missing or incorrect.' }, 401);
    const code = cleanCode(decodeURIComponent(match[1]));
    const key = VIDEO_PREFIX + code.toLowerCase();
    if (!await env.VIDEOS.get(key)) return json({ error: 'Video not found.' }, 404);
    await env.VIDEOS.delete(key);
    return json({ success: true });
  }
  return json({ error: 'Not found.' }, 404);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ status: 'ok' });
    if (url.pathname.startsWith('/api/')) return api(request, env, url);
    if (url.pathname === '/admin') return env.ASSETS.fetch(new Request(new URL('/admin.html', url), request));
    if (request.method === 'GET' && url.pathname.length > 1 && !url.pathname.includes('.')) {
      const code = cleanCode(decodeURIComponent(url.pathname.slice(1)));
      if (code && await env.VIDEOS.get(VIDEO_PREFIX + code.toLowerCase())) return Response.redirect(new URL('/?mov=' + encodeURIComponent(code), url), 302);
    }
    return env.ASSETS.fetch(request);
  }
};
