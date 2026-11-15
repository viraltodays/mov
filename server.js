const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'videos.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function readVideos() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeVideos(videos) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));
}

function sanitizeCode(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/videos', (req, res) => {
  res.json(readVideos());
});

app.post('/api/videos', (req, res) => {
  const { code, title, url } = req.body || {};
  const cleanedCode = sanitizeCode(code);

  if (!cleanedCode || !title || !url) {
    return res.status(400).json({ error: 'Code, title, and URL are required.' });
  }

  const videos = readVideos();
  const existingIndex = videos.findIndex((video) => video.code === cleanedCode);

  const record = {
    code: cleanedCode,
    title: String(title).trim(),
    url: String(url).trim()
  };

  if (existingIndex >= 0) {
    videos[existingIndex] = record;
  } else {
    videos.push(record);
  }

  writeVideos(videos);
  res.status(201).json(record);
});

app.delete('/api/videos/:code', (req, res) => {
  const targetCode = sanitizeCode(req.params.code);
  const videos = readVideos();
  const filtered = videos.filter((video) => video.code !== targetCode);

  if (filtered.length === videos.length) {
    return res.status(404).json({ error: 'Video not found.' });
  }

  writeVideos(filtered);
  res.json({ success: true, code: targetCode });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:code', (req, res) => {
  const videos = readVideos();
  const code = sanitizeCode(req.params.code);
  const video = videos.find((entry) => entry.code === code);

  if (!video) {
    return res.status(404).send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Video not found</title>
          <style>
            body { font-family: Arial, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #111827; color: white; }
            .card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 2rem; text-align: center; }
            a { color: #38bdf8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Video not found</h1>
            <p>The code <strong>${escapeHtml(code)}</strong> has not been added yet.</p>
            <p><a href="/">Return to the homepage</a></p>
          </div>
        </body>
      </html>
    `);
  }

  const isVideoTag = /\.(mp4|webm|ogg)(\?|$)/i.test(video.url);
  const embedMarkup = isVideoTag
    ? `<video controls autoplay playsinline src="${escapeHtml(video.url)}" style="width:100%; max-width:900px; border-radius:18px; background:#000;" />`
    : `<iframe src="${escapeHtml(video.url)}" title="${escapeHtml(video.title)}" allowfullscreen style="width:100%; max-width:900px; min-height:500px; border:none; border-radius:18px;" />`;

  const page = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(video.title)} | ${escapeHtml(video.code)}</title>
      <style>
        :root {
          --bg: #0f172a;
          --panel: #111827;
          --text: #e2e8f0;
          --muted: #94a3b8;
          --accent: #38bdf8;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top, #1e293b, var(--bg) 55%);
          font-family: Arial, sans-serif;
          color: var(--text);
        }
        .wrap {
          width: min(100%, 1100px);
          padding: 24px;
        }
        .back {
          color: var(--accent);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1rem;
        }
        .card {
          background: rgba(15, 23, 42, 0.82);
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.4);
        }
        h1 {
          margin: 0 0 0.5rem;
          font-size: clamp(2rem, 5vw, 3rem);
        }
        .meta {
          color: var(--muted);
          margin-bottom: 1.5rem;
        }
        .player {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #020817;
          border-radius: 18px;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <a class="back" href="/">← Back to homepage</a>
        <div class="card">
          <h1>${escapeHtml(video.title)}</h1>
          <div class="meta">Video code: ${escapeHtml(video.code)}</div>
          <div class="player">${embedMarkup}</div>
        </div>
      </div>
    </body>
  </html>`;

  res.send(page);
});

app.listen(PORT, () => {
  console.log(`Video site running at http://localhost:${PORT}`);
});
