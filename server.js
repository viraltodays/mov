const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'videos.json');
const ALLOWED_VIDEO_HOSTS = new Set(['cdn2.videy.co', 'cdn.slicedrv.com']);

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readVideos() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVideos(videos) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));
}

function cleanCode(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
}

function validateVideoUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && ALLOWED_VIDEO_HOSTS.has(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/videos', (_req, res) => res.json(readVideos()));
app.get('/api/videos/:code', (req, res) => {
  const code = cleanCode(req.params.code).toLowerCase();
  const video = readVideos().find((item) => item.code.toLowerCase() === code);
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  res.json(video);
});

app.post('/api/videos', (req, res) => {
  const code = cleanCode(req.body?.code);
  const title = String(req.body?.title || '').trim().slice(0, 160);
  const url = validateVideoUrl(req.body?.url);
  if (!code || !title || !url) {
    return res.status(400).json({ error: 'Enter a video code, title, and an HTTPS URL from cdn2.videy.co or cdn.slicedrv.com.' });
  }

  const videos = readVideos();
  const index = videos.findIndex((video) => video.code.toLowerCase() === code.toLowerCase());
  const record = { code, title, url };
  if (index >= 0) videos[index] = record;
  else videos.unshift(record);
  writeVideos(videos);
  res.status(index >= 0 ? 200 : 201).json(record);
});

app.delete('/api/videos/:code', (req, res) => {
  const code = cleanCode(req.params.code).toLowerCase();
  const videos = readVideos();
  const remaining = videos.filter((video) => video.code.toLowerCase() !== code);
  if (remaining.length === videos.length) return res.status(404).json({ error: 'Video not found.' });
  writeVideos(remaining);
  res.json({ success: true });
});

app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/:code', (req, res) => {
  if (['api', 'health'].includes(req.params.code)) return res.sendStatus(404);
  res.redirect('/?mov=' + encodeURIComponent(cleanCode(req.params.code)));
});
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Video site running at http://localhost:${PORT}`));
