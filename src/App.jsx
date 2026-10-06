import React, { useState } from 'react'

const GITHUB_ACCOUNT = 'https://github.com/purujawa06-bot'
const PURU_AI_URL = 'https://github.com/purujawa06-bot/PURU-AI'

const NAV_ITEMS = [
  { href: '#top', label: 'Home', icon: 'fa-solid fa-house' },
  { href: '#projects', label: 'Projects', icon: 'fa-solid fa-layer-group' },
  { href: '#skills', label: 'Skills', icon: 'fa-solid fa-wrench' },
  { href: '#about', label: 'About', icon: 'fa-solid fa-user' },
  { href: '#faq', label: 'FAQ', icon: 'fa-solid fa-circle-question' },
  { href: '#contact', label: 'Contact', icon: 'fa-solid fa-envelope' },
]

function ProjectCard({ icon, title, status, statusLive, desc, tags, children }) {
  return (
    <article className="project">
      <div className="project-top">
        <div className="proj-icon" aria-hidden="true"><i className={icon}></i></div>
        <span className={statusLive ? 'badge-live' : 'badge-soon'}>
          <span className={statusLive ? 'live-dot' : 'soon-dot'} aria-hidden="true"></span>
          {status}
        </span>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="tags" aria-label="Technologies">
        {tags.map((t) => (<span key={t} className="tag">{t}</span>))}
      </div>
      <div className="go">{children}</div>
    </article>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const year = new Intl.NumberFormat('en-US', { useGrouping: false }).format(new Date().getFullYear())

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" translate="no" aria-label="PuruBoy home — Ricky Purwanto portfolio">
            <span className="brand-mark" aria-hidden="true"><i className="fa-solid fa-bolt"></i></span>
            <span>PuruBoy</span>
          </a>
          <button
            className="nav-toggle"
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <i className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden="true"></i>
          </button>
          <nav id="primary-nav" className={'nav-buttons' + (open ? ' is-open' : '')} aria-label="Primary">
            {NAV_ITEMS.map((n) => (
              <a key={n.href} className="nav-btn" href={n.href} onClick={() => setOpen(false)}>
                <i className={n.icon} aria-hidden="true"></i>
                <span>{n.label}</span>
              </a>
            ))}
            <a className="btn btn-primary nav-cta" href={GITHUB_ACCOUNT} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              <i className="fa-brands fa-github" aria-hidden="true"></i>
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <div className="wrap">
          <div className="hero" id="top">
            <div>
              <span className="eyebrow">
                <span className="live-dot" aria-hidden="true"></span>
                Web Developer Indonesia — open to collaboration
              </span>
              <h1>Ricky Purwanto (PuruBoy) — Web, API &amp; AI Developer</h1>
              <p className="lead">
                Portfolio of <strong>Ricky Purwanto</strong>, a web developer based in Indonesia (WIB).
                I build fast, clean, and reliable web apps with <strong>Vite + React</strong>,
                design <strong>REST APIs</strong>, and ship <strong>AI Telegram bots</strong> like PuruClaw (PURU-AI).
                All work is open source on GitHub.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#projects">
                  <i className="fa-solid fa-arrow-down" aria-hidden="true"></i> View Projects
                </a>
                <a className="btn" href={GITHUB_ACCOUNT} target="_blank" rel="noreferrer">
                  <i className="fa-brands fa-github" aria-hidden="true"></i> GitHub Profile
                </a>
                <a className="btn btn-ghost" href="#contact">
                  <i className="fa-solid fa-paper-plane" aria-hidden="true"></i> Contact
                </a>
              </div>
              <dl className="stats" aria-label="Highlights">
                <div className="stat"><dt>Projects</dt><dd>2</dd></div>
                <div className="stat"><dt>Stack</dt><dd>Vite + React</dd></div>
                <div className="stat"><dt>Deploy</dt><dd>GitHub Actions</dd></div>
              </dl>
            </div>
            <div className="card-visual" role="img" aria-label="Terminal showing PuruBoy project list and deploy status">
              <div className="dots" aria-hidden="true"><i style={{ background: '#ff5f57' }}></i><i style={{ background: '#febc2e' }}></i><i style={{ background: '#28c840' }}></i></div>
              <div className="code">{`$ whoami
> puruboy — Ricky Purwanto

$ ls ./projects
> api/        (coming soon…)
> puruclaw/   (live on GitHub →)

$ npm run deploy
> vite build ✓
> actions deploy ✓
> https://puruboy.duckdns.org ✓`}</div>
            </div>
          </div>

          <section id="projects" aria-labelledby="projects-h">
            <div className="section-title">
              <h2 id="projects-h">Projects by Ricky Purwanto</h2>
              <p>Web, API &amp; AI work — open source on GitHub.</p>
            </div>
            <div className="grid grid-2">
              <ProjectCard
                icon="fa-solid fa-plug"
                title="Project API — REST API Service Indonesia"
                status="Coming Soon"
                statusLive={false}
                desc="Public REST API service with clean documentation, versioning, and cloud deploy. Endpoints release soon — follow progress on GitHub."
                tags={['REST', 'Documentation', 'Cloud']}
              >
                <a className="btn" href={GITHUB_ACCOUNT} target="_blank" rel="noreferrer">
                  <i className="fa-brands fa-github" aria-hidden="true"></i> Follow on GitHub
                </a>
                <a className="btn btn-ghost" href="#contact">
                  <i className="fa-solid fa-bell" aria-hidden="true"></i> Get Notified
                </a>
              </ProjectCard>
              <ProjectCard
                icon="fa-solid fa-robot"
                title="PuruClaw (PURU-AI) — Telegram AI Assistant"
                status="Live on GitHub"
                statusLive
                desc="Self-hosted AI assistant for Telegram built in Go — workspace operator with local tools, skills & smart memory. Open source, production-ready."
                tags={['Go', 'Telegram', 'AI Agent']}
              >
                <a className="btn btn-primary" href={PURU_AI_URL} target="_blank" rel="noreferrer">
                  <i className="fa-brands fa-github" aria-hidden="true"></i> Open Repository
                </a>
                <a className="btn" href={PURU_AI_URL} target="_blank" rel="noreferrer">
                  <i className="fa-solid fa-star" aria-hidden="true"></i> Star
                </a>
              </ProjectCard>
            </div>
          </section>

          <section id="skills" aria-labelledby="skills-h">
            <div className="section-title">
              <h2 id="skills-h">Skills &amp; Tech Stack</h2>
              <p>What Ricky Purwanto works with.</p>
            </div>
            <div className="grid grid-3">
              <article className="mini"><i className="fa-solid fa-globe" aria-hidden="true"></i><h3>Web Development</h3><p>Responsive portfolio &amp; landing pages with Vite, React &amp; modern CSS. SEO-friendly, fast, accessible.</p></article>
              <article className="mini"><i className="fa-solid fa-plug" aria-hidden="true"></i><h3>REST API Design</h3><p>Clean REST endpoints with clear docs, versioning &amp; cloud deployment.</p></article>
              <article className="mini"><i className="fa-solid fa-robot" aria-hidden="true"></i><h3>AI &amp; Automation</h3><p>Telegram bots, AI agents &amp; workflow automation in Go (PuruClaw / PURU-AI).</p></article>
            </div>
          </section>

          <section id="about" aria-labelledby="about-h">
            <div className="section-title">
              <h2 id="about-h">About Ricky Purwanto</h2>
            </div>
            <article className="project about">
              <div className="about-row">
                <div className="avatar" aria-hidden="true"><i className="fa-solid fa-user-astronaut"></i></div>
                <div>
                  <h3>Ricky Purwanto — PuruBoy</h3>
                  <p className="muted"><i className="fa-solid fa-location-dot" aria-hidden="true"></i> Indonesia (WIB) · <span translate="no">@purujawa06-bot</span></p>
                </div>
              </div>
              <p>
                I'm Ricky Purwanto (PuruBoy), a builder based in Indonesia focused on web, API, and AI tooling.
                My portfolio covers Vite + React frontends, upcoming REST API services, and PuruClaw — a
                self-hosted Telegram AI assistant. Every project ships open on GitHub: review the code,
                open issues, or start a collaboration.
              </p>
              <div className="tags">
                <span className="tag"><i className="fa-solid fa-globe" aria-hidden="true"></i> Web</span>
                <span className="tag"><i className="fa-solid fa-plug" aria-hidden="true"></i> API</span>
                <span className="tag"><i className="fa-solid fa-robot" aria-hidden="true"></i> AI</span>
                <span className="tag"><i className="fa-brands fa-github" aria-hidden="true"></i> Open Source</span>
              </div>
              <div className="go">
                <a className="btn btn-primary" href={GITHUB_ACCOUNT} target="_blank" rel="noreferrer">
                  <i className="fa-brands fa-github" aria-hidden="true"></i> Visit GitHub
                </a>
              </div>
            </article>
          </section>

          <section id="faq" aria-labelledby="faq-h">
            <div className="section-title">
              <h2 id="faq-h">FAQ</h2>
              <p>Frequently asked about PuruBoy.</p>
            </div>
            <div className="faq">
              <details className="faq-item">
                <summary>Who is Ricky Purwanto (PuruBoy)?</summary>
                <p>Ricky Purwanto, aka PuruBoy, is a web developer from Indonesia (WIB) building web apps, REST APIs, and AI tools. All public work is on GitHub at @purujawa06-bot.</p>
              </details>
              <details className="faq-item">
                <summary>What is PuruClaw (PURU-AI)?</summary>
                <p>PuruClaw is a self-hosted Telegram AI assistant built in Go — a workspace operator with local tools, skills, and smart memory. Repository: github.com/purujawa06-bot/PURU-AI.</p>
              </details>
              <details className="faq-item">
                <summary>When does the Project API launch?</summary>
                <p>Project API is coming soon — REST endpoints with documentation. Follow @purujawa06-bot on GitHub or use Get Notified to track the release.</p>
              </details>
              <details className="faq-item">
                <summary>How to contact Ricky Purwanto?</summary>
                <p>Via GitHub: open an issue on any public repo at github.com/purujawa06-bot. Based in Indonesia (WIB), open to collaboration.</p>
              </details>
            </div>
          </section>

          <section id="contact" aria-labelledby="contact-h">
            <div className="section-title">
              <h2 id="contact-h">Contact Ricky Purwanto</h2>
              <p>Start a collaboration.</p>
            </div>
            <article className="project contact-card">
              <h3>Work Together?</h3>
              <p>Find all public work and activity on GitHub. Open an issue on any repo to get in touch — Indonesia (WIB).</p>
              <address className="go" style={{ fontStyle: 'normal' }}>
                <a className="btn btn-primary" href={GITHUB_ACCOUNT} target="_blank" rel="noreferrer">
                  <i className="fa-brands fa-github" aria-hidden="true"></i> Contact via GitHub
                </a>
                <a className="btn" href="#top">
                  <i className="fa-solid fa-arrow-up" aria-hidden="true"></i> Back to Top
                </a>
              </address>
            </article>
          </section>
        </div>
      </main>

      <footer>
        <div className="wrap foot-inner">
          <span>© {year} <span translate="no">PuruBoy</span> — Ricky Purwanto, Web Developer Indonesia. Built with Vite + React, deployed via GitHub Actions.</span>
          <a className="to-top" href="#top" aria-label="Back to top"><i className="fa-solid fa-arrow-up" aria-hidden="true"></i></a>
        </div>
      </footer>
    </>
  )
}
