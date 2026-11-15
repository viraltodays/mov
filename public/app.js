* {
  box-sizing: border-box;
}

:root {
  --bg: #0f172a;
  --bg-soft: #111827;
  --surface: rgba(15, 23, 42, 0.9);
  --surface-2: rgba(30, 41, 59, 0.8);
  --card: rgba(148, 163, 184, 0.08);
  --primary: #38bdf8;
  --primary-strong: #0ea5e9;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --border: rgba(148, 163, 184, 0.2);
  --shadow: 0 30px 80px rgba(15, 23, 42, 0.5);
}

html, body {
  margin: 0;
  min-height: 100%;
  background: linear-gradient(180deg, #020817, var(--bg));
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

img {
  max-width: 100%;
  display: block;
}

.container {
  width: min(1100px, calc(100% - 32px));
  margin: 0 auto;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
  background: rgba(2, 8, 23, 0.6);
  border-bottom: 1px solid var(--border);
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
}

.brand {
  font-weight: 700;
  letter-spacing: 0.04em;
  font-size: 1.1rem;
}

nav a {
  color: var(--text);
  text-decoration: none;
  opacity: 0.9;
}

.hero {
  padding: 72px 0 48px;
}

.hero-inner {
  display: grid;
  min-height: 300px;
  place-items: center;
}

.eyebrow {
  color: var(--primary);
  margin-bottom: 1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 700;
}

h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
  margin: 0;
  line-height: 1.05;
}

.lead {
  max-width: 650px;
  color: var(--muted);
  margin: 1rem 0 0;
  font-size: 1.08rem;
  line-height: 1.7;
}

.actions {
  margin-top: 1.5rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #082f49;
}

.button.secondary {
  background: transparent;
  border-color: var(--border);
  color: var(--text);
}

.videos {
  padding: 24px 0 80px;
}

.section-heading {
  margin-bottom: 1.5rem;
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.video-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.video-card a {
  color: var(--text);
  text-decoration: none;
}

.video-card h3 {
  margin: 0.85rem 0 0.4rem;
  font-size: 1.15rem;
}

.video-thumb {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(15, 23, 42, 0.9));
  border: 1px solid var(--border);
  border-radius: 12px;
  height: 170px;
  display: grid;
  place-items: center;
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.video-code {
  color: var(--muted);
  font-size: 0.85rem;
}

.admin-body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 40px 0;
}

.admin-shell {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 24px;
  width: min(1100px, calc(100% - 32px));
}

.admin-panel,
.admin-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow);
}

#video-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

label {
  display: grid;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--muted);
}

input {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  padding: 0.9rem 1rem;
  font-size: 1rem;
}

.admin-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1rem;
}

.item strong {
  display: block;
  margin-bottom: 0.2rem;
}

.item small {
  color: var(--muted);
  display: inline-block;
  margin-top: 0.2rem;
}

.item a {
  color: var(--primary);
  text-decoration: none;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
}

@media (max-width: 760px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .item {
    flex-direction: column;
    align-items: flex-start;
  }
}
