import React from 'react'

const PURU_AI_URL = 'https://github.com/purujawa06-bot/PURU-AI'

function ProjectCard({ emoji, title, desc, tags, badge, actions }) {
  return (
    <article className="project">
      <div style={{ fontSize: 30 }} aria-hidden="true">{emoji}</div>
      <h3>{title}</h3>
      {badge ? <span className="badge-soon">{badge}</span> : null}
      <p>{desc}</p>
      <div className="tags" aria-label="Teknologi">
        {tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="go">{actions}</div>
    </article>
  )
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Lewati ke konten utama</a>
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" translate="no">
            <span className="brand-mark" aria-hidden="true">⚡</span>
            <span>PuruBoy</span>
          </a>
          <nav className="nav-links" aria-label="Navigasi utama">
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a className="btn" href={PURU_AI_URL} target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <div className="wrap">
          <div className="hero" id="top">
            <div>
              <span className="eyebrow"><span className="live-dot" aria-hidden="true"></span> puruboy.duckdns.org — online</span>
              <h1>PuruBoy <span>Portfolio</span></h1>
              <p className="lead">
                Halo, saya <strong>Ricky Purwanto</strong> — builder yang suka ngoprek web,
                API, dan AI assistant. Halaman ini rumah untuk semua project saya:
                ada yang sudah jalan, ada yang coming soon. Santai, gas terus. ⚡
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#projects">Lihat Projects ↓</a>
                <a className="btn" href={PURU_AI_URL} target="_blank" rel="noreferrer">⭐ PuruClaw di GitHub</a>
              </div>
              <div className="stats" aria-label="Statistik singkat">
                <div className="stat"><strong>2+</strong><span>Projects aktif</span></div>
                <div className="stat"><strong>⚡</strong><span>Vite + React</span></div>
                <div className="stat"><strong>🚀</strong><span>Deploy via Actions</span></div>
              </div>
            </div>
            <div className="card-visual" aria-hidden="true">
              <div className="dots"><i style={{ background: '#ff5f57' }}></i><i style={{ background: '#febc2e' }}></i><i style={{ background: '#28c840' }}></i></div>
              <div className="code">{`$ whoami
> puruboy — Ricky Purwanto

$ ls ./projects
> api/        (coming soon…)
> puruclaw/   (live on GitHub →)

$ npm run deploy
> vite build ✓
> gh-pages ✓ via Actions
> https://puruboy.duckdns.org ✓`}</div>
            </div>
          </div>

          <section id="projects" aria-labelledby="projects-h">
            <div className="section-title">
              <h2 id="projects-h">Projects</h2>
              <p>Koleksi oprekan PuruBoy.</p>
            </div>
            <div className="grid">
              <ProjectCard
                emoji="🔌"
                title="Project API"
                desc="API service racikan sendiri — dokumentasi & endpoint publik segera hadir. Stay tuned."
                tags={['REST', 'Coming Soon']}
                badge="🚧 COMING SOON"
                actions={<a className="btn" href="#projects" aria-disabled="true" onClick={(e) => e.preventDefault()}>Notify Me (soon)</a>}
              />
              <ProjectCard
                emoji="🤖"
                title="PuruClaw"
                desc="AI assistant self-hosted buat Telegram — workspace operator dengan local tools, skills & smart memory. Live di GitHub."
                tags={['Go', 'Telegram', 'AI Agent']}
                actions={
                  <>
                    <a className="btn btn-primary" href={PURU_AI_URL} target="_blank" rel="noreferrer">Buka di GitHub →</a>
                    <a className="btn" href="https://github.com/purujawa06-bot/PURU-AI" target="_blank" rel="noreferrer">⭐ Star</a>
                  </>
                }
              />
              <ProjectCard
                emoji="🌐"
                title="MirrorCast (legacy)"
                desc="Project WebRTC MirrorCast sebelumnya yang pernah live di halaman ini. Sudah dipensiunkan demi portfolio baru."
                tags={['WebRTC', 'Archived']}
                actions={<a className="btn" href="https://github.com/purujawa06-bot/purujawa06-bot.github.io" target="_blank" rel="noreferrer">Lihat history repo</a>}
              />
            </div>
          </section>

          <section id="about" aria-labelledby="about-h">
            <div className="section-title">
              <h2 id="about-h">About</h2>
            </div>
            <article className="project">
              <p>
                Saya <strong>Ricky Purwanto</strong> dari Indonesia (WIB). Fokus ke web, API,
                dan AI tools yang ringan tapi nendang. Semua project open di GitHub{' '}
                <a href="https://github.com/purujawa06-bot" target="_blank" rel="noreferrer"><strong>@purujawa06-bot</strong></a>.
                Kalau mau kolaborasi, sapa aja. 😎
              </p>
              <div className="tags">
                <span className="tag">Indonesia</span>
                <span className="tag">WIB</span>
                <span className="tag">Web</span>
                <span className="tag">API</span>
                <span className="tag">AI</span>
              </div>
            </article>
          </section>
        </div>
      </main>

      <footer>
        <div className="wrap">
          <span>© {new Date().getFullYear()} <span translate="no">PuruBoy</span> — Ricky Purwanto. Built with Vite + React, deployed via GitHub Actions.</span>
          <span><a href="#top" style={{ textDecoration: 'none' }}>↑ Back to top</a></span>
        </div>
      </footer>
    </>
  )
}
