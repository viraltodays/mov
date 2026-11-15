const app = document.getElementById('app');
const form = document.getElementById('video-form');
const list = document.getElementById('admin-list');
const message = document.getElementById('form-message');

async function getVideos() {
  const response = await fetch('/api/videos');
  if (!response.ok) throw new Error('Could not load videos.');
  return response.json();
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg)(?:$|\?)/i.test(new URL(url).pathname + new URL(url).search);
}

function playerMarkup(video) {
  const safeUrl = esc(video.url);
  return isDirectVideo(video.url)
    ? `<video class="video-player" controls playsinline autoplay src="${safeUrl}"></video>`
    : `<iframe class="video-player" src="${safeUrl}" title="${esc(video.title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
}

async function renderWatchPage() {
  if (!app) return;
  const code = new URLSearchParams(location.search).get('mov');
  try {
    const videos = await getVideos();
    if (!code) {
      document.title = 'Mov — Watch';
      app.innerHTML = `
        <section class="welcome-panel">
          <p class="eyebrow">VIDEO ON DEMAND</p>
          <h1>Your next watch<br /><span>starts here.</span></h1>
          <p class="muted">Open a video link to start watching.</p>
        </section>
        <section class="browse-section"><div class="section-title"><div><p class="eyebrow">THE LIBRARY</p><h2>Latest videos</h2></div><span class="count-badge">${videos.length}</span></div>
        ${videos.length ? `<div class="video-grid">${videos.map((video) => `<a class="video-card" href="/?mov=${encodeURIComponent(video.code)}"><div class="thumbnail"><span class="play-icon">▶</span></div><div class="card-copy"><h3>${esc(video.title)}</h3><span class="code-label">${esc(video.code)}</span></div></a>`).join('')}</div>` : '<div class="empty-state">No videos have been added yet.</div>'}</section>`;
      return;
    }
    const video = videos.find((entry) => entry.code.toLowerCase() === code.toLowerCase());
    if (!video) {
      app.innerHTML = '<section class="empty-state not-found"><h1>Video not found</h1><p>Check the link or return to the <a href="/">video library</a>.</p></section>';
      return;
    }
    document.title = `${video.title} — Mov`;
    app.innerHTML = `<section class="watch-view"><a class="back-link" href="/">← All videos</a><div class="player-frame">${playerMarkup(video)}</div><div class="watch-details"><div><p class="eyebrow">NOW PLAYING</p><h1>${esc(video.title)}</h1></div><span class="code-label">${esc(video.code)}</span></div></section>`;
  } catch (error) {
    app.innerHTML = `<section class="empty-state"><h1>Could not load videos</h1><p>${esc(error.message)}</p></section>`;
  }
}

async function renderAdmin() {
  if (!list) return;
  try {
    const videos = await getVideos();
    document.getElementById('video-count').textContent = String(videos.length);
    if (!videos.length) {
      list.innerHTML = '<div class="empty-state">Your library is empty. Add your first video using the form.</div>';
      return;
    }
    list.innerHTML = videos.map((video) => `<article class="admin-card"><div class="admin-card-info"><span class="code-label">${esc(video.code)}</span><h3>${esc(video.title)}</h3><a href="/?mov=${encodeURIComponent(video.code)}" target="_blank" rel="noreferrer">Open video ↗</a></div><button class="delete-button" type="button" data-code="${esc(video.code)}" aria-label="Delete ${esc(video.title)}">Delete</button></article>`).join('');
  } catch (error) {
    list.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`;
  }
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    message.textContent = 'Saving…';
    const body = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save video.');
      message.textContent = `Saved. Share link: ${location.origin}/?mov=${result.code}`;
      form.reset();
      await renderAdmin();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('.delete-button');
    if (!button || !confirm(`Delete video ${button.dataset.code}?`)) return;
    const response = await fetch(`/api/videos/${encodeURIComponent(button.dataset.code)}`, { method: 'DELETE' });
    if (!response.ok) message.textContent = 'Could not delete video.';
    await renderAdmin();
  });
}

if (app) renderWatchPage();
if (list) renderAdmin();
