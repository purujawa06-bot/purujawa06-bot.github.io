import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { posts, projects, site } from '../content/site.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const NAV_ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/blog/', label: 'Artikel' },
  { href: '/projects/', label: 'Proyek' },
  { href: '/about/', label: 'Tentang' },
];

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape a value for safe use in HTML attributes and text nodes.
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

/**
 * Build an absolute URL for a root-relative path.
 * @param {string} path
 * @returns {string}
 */
function absoluteUrl(path) {
  return new URL(path, site.url).href;
}

/**
 * Format an ISO date (YYYY-MM-DD) as an Indonesian long date.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * Estimate reading time from the rendered HTML body.
 * @param {string} html
 * @returns {number} Whole minutes, at least 1.
 */
function readingTime(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.round(text.split(' ').length / 200));
}

/**
 * Serialize JSON-LD and neutralize any closing script tag.
 * @param {object[]} items
 * @returns {string}
 */
function jsonLd(items) {
  const payload = { '@context': 'https://schema.org', '@graph': items };
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}

function personSchema() {
  return {
    '@type': 'Person',
    '@id': `${site.url}/#person`,
    name: site.author,
    alternateName: 'PuruBoy',
    url: site.url,
    image: site.ogImage,
    jobTitle: 'Web, API & AI Developer',
    address: { '@type': 'PostalAddress', addressCountry: 'ID' },
    sameAs: [site.github, site.telegram, site.puruClawRepo],
  };
}

function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: site.language,
    publisher: { '@id': `${site.url}/#person` },
    author: { '@id': `${site.url}/#person` },
  };
}

function breadcrumbSchema(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Render the shared document shell.
 * @param {object} options
 * @param {string} options.title Full document title.
 * @param {string} options.description Meta description.
 * @param {string} options.path Root-relative page path.
 * @param {string} options.body Main content HTML.
 * @param {object[]} [options.schema] Page-specific JSON-LD nodes.
 * @param {string} [options.type] Open Graph type.
 * @param {boolean} [options.noindex] Exclude the page from search results.
 * @returns {string}
 */
function layout({ title, description, path, body, schema = [], type = 'website', noindex = false }) {
  const canonical = absoluteUrl(path);
  const robots = noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const schemaGraph = [personSchema(), websiteSchema(), ...schema];

  return `<!doctype html>
<html lang="${site.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <meta name="author" content="${escapeHtml(site.author)}">
  <meta name="theme-color" content="${site.themeColor}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.name)} — RSS" href="/rss.xml">
  <link rel="stylesheet" href="/styles.css">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${escapeHtml(site.name)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site.ogImage}">
  <meta property="og:image:alt" content="${escapeHtml(site.name)}">
  <meta property="og:locale" content="${site.locale}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${site.ogImage}">
  ${jsonLd(schemaGraph)}
</head>
<body>
  <a class="skip-link" href="#main">Lewati ke konten</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/" aria-label="${escapeHtml(site.name)} — beranda">
        <span class="brand-mark" aria-hidden="true">⚡</span>
        <span>PuruBoy<span class="brand-dot">.</span></span>
      </a>
      <nav class="site-nav" aria-label="Navigasi utama">
        ${NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? path === '/' : path.startsWith(item.href);
          return `<a href="${item.href}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>`;
        }).join('\n        ')}
      </nav>
      <a class="button button-small button-primary header-cta" href="${site.apiDocs}" target="_blank" rel="noopener">
        Dokumentasi API
      </a>
    </div>
  </header>

  <main id="main">
    ${body}
  </main>

  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <a class="brand" href="/">
          <span class="brand-mark" aria-hidden="true">⚡</span>
          <span>PuruBoy<span class="brand-dot">.</span></span>
        </a>
        <p class="footer-copy">${escapeHtml(site.tagline)}</p>
      </div>
      <div>
        <h2 class="footer-title">Jelajahi</h2>
        <ul class="footer-links">
          ${NAV_ITEMS.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join('\n          ')}
          <li><a href="/rss.xml">RSS Feed</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-title">Proyek</h2>
        <ul class="footer-links">
          <li><a href="${site.apiDocs}" target="_blank" rel="noopener">Dokumentasi API</a></li>
          <li><a href="${site.apiRepo}" target="_blank" rel="noopener">Na-api di GitHub</a></li>
          <li><a href="${site.puruClawRepo}" target="_blank" rel="noopener">PURU-AI di GitHub</a></li>
          <li><a href="${site.telegram}" target="_blank" rel="noopener">Telegram @puruboy_hub</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p>© ${new Date().getUTCFullYear()} ${escapeHtml(site.author)}. Dibangun dengan HTML statis, tanpa framework.</p>
      <a href="#main">Kembali ke atas</a>
    </div>
  </footer>
</body>
</html>
`;
}

function tagList(tags) {
  return `<ul class="tag-list" aria-label="Topik">${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`;
}

function postCard(post, featured = false) {
  return `<article class="post-card${featured ? ' post-card-featured' : ''}">
    <div class="post-meta">
      <time datetime="${post.date}">${formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>${readingTime(post.body)} menit baca</span>
    </div>
    <h3><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(post.description)}</p>
    ${tagList(post.tags)}
    <a class="text-link" href="/blog/${post.slug}/">Baca artikel <span aria-hidden="true">→</span></a>
  </article>`;
}

function projectCard(project) {
  const links = project.links
    .map(
      (link) =>
        `<a class="button${link.primary ? ' button-primary' : ''}" href="${link.href}"${
          link.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''
        }>${escapeHtml(link.label)}</a>`,
    )
    .join('');

  return `<article class="project-card">
    <div class="project-head">
      <h2>${escapeHtml(project.name)}</h2>
      <span class="status status-${project.statusClass}">${escapeHtml(project.status)}</span>
    </div>
    <p>${escapeHtml(project.description)}</p>
    ${tagList(project.tags)}
    <div class="button-row">${links}</div>
  </article>`;
}

function homePage() {
  const [featured, ...others] = posts;
  const latest = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const latestDate = latest[0]?.updated ?? latest[0]?.date;

  const body = `<section class="wrap hero">
    <p class="eyebrow"><span class="pulse" aria-hidden="true"></span> Blog resmi PuruBoy</p>
    <h1>PuruBoy Blog — tutorial API, catatan proyek, dan hal yang sedang dibangun.</h1>
    <p class="lead">Tempat saya membagikan cara memakai PuruBoy API, pelajaran dari proyek open source, dan update proyek berikutnya. Ditulis dalam bahasa Indonesia, tanpa basa-basi.</p>
    <div class="button-row">
      <a class="button button-primary" href="/blog/">Baca artikel</a>
      <a class="button" href="${site.apiDocs}" target="_blank" rel="noopener">Coba dokumentasi API</a>
      <a class="button button-ghost" href="${site.github}" target="_blank" rel="noopener">GitHub</a>
    </div>
    <dl class="stats">
      <div><dt>Artikel</dt><dd>${posts.length}</dd></div>
      <div><dt>Proyek</dt><dd>${projects.length}</dd></div>
      <div><dt>Lisensi</dt><dd>Open source</dd></div>
    </dl>
  </section>

  <section class="wrap section" aria-labelledby="featured-title">
    <div class="section-head">
      <h2 id="featured-title">Artikel unggulan</h2>
      <a class="text-link" href="/blog/">Lihat semua <span aria-hidden="true">→</span></a>
    </div>
    ${postCard(featured, true)}
  </section>

  <section class="wrap section" aria-labelledby="latest-title">
    <div class="section-head">
      <h2 id="latest-title">Artikel terbaru</h2>
    </div>
    <div class="post-grid">
      ${others.map((post) => postCard(post)).join('\n      ')}
    </div>
  </section>

  <section class="wrap section" aria-labelledby="projects-title">
    <div class="section-head">
      <h2 id="projects-title">Proyek yang sedang dikerjakan</h2>
      <a class="text-link" href="/projects/">Semua proyek <span aria-hidden="true">→</span></a>
    </div>
    <div class="project-grid">
      ${projects.map((project) => projectCard(project)).join('\n      ')}
    </div>
  </section>

  <section class="wrap section">
    <div class="cta">
      <div>
        <h2>Siap mencoba PuruBoy API?</h2>
        <p>Dokumentasi interaktif, contoh request, dan Try It Out langsung dari browser.</p>
      </div>
      <a class="button button-primary" href="${site.apiDocs}" target="_blank" rel="noopener">Buka dokumentasi</a>
    </div>
  </section>`;

  return layout({
    title: 'PuruBoy Blog — Tutorial API, AI, dan Proyek Open Source',
    description: site.description,
    path: '/',
    body,
    schema: [
      {
        '@type': 'Blog',
        '@id': `${site.url}/#blog`,
        url: site.url,
        name: site.name,
        description: site.description,
        inLanguage: site.language,
        publisher: { '@id': `${site.url}/#person` },
        blogPost: latest.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: absoluteUrl(`/blog/${post.slug}/`),
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
        })),
      },
      {
        '@type': 'CollectionPage',
        url: site.url,
        name: site.name,
        isPartOf: { '@id': `${site.url}/#website` },
        about: { '@id': `${site.url}/#person` },
        dateModified: latestDate,
      },
    ],
  });
}

function blogIndexPage() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const body = `<section class="wrap page-head">
    <p class="eyebrow">Arsip</p>
    <h1>Artikel PuruBoy: tutorial API, AI, dan proyek open source</h1>
    <p class="lead">Tutorial, catatan rilis, dan pemikiran seputar PuruBoy API, AI, serta proyek open source.</p>
  </section>
  <section class="wrap section" aria-label="Daftar artikel">
    <div class="post-grid">
      ${sorted.map((post) => postCard(post)).join('\n      ')}
    </div>
  </section>`;

  return layout({
    title: 'Artikel — PuruBoy Blog',
    description:
      'Arsip artikel PuruBoy: tutorial PuruBoy API, panduan AI chat dan downloader, catatan proyek PuruClaw, serta roadmap open source.',
    path: '/blog/',
    body,
    schema: [
      {
        '@type': 'CollectionPage',
        url: absoluteUrl('/blog/'),
        name: 'Artikel PuruBoy',
        isPartOf: { '@id': `${site.url}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: sorted.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/blog/${post.slug}/`),
            name: post.title,
          })),
        },
      },
    ],
  });
}

function postPage(post) {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const position = sorted.findIndex((item) => item.slug === post.slug);
  const previous = sorted[position + 1];
  const next = sorted[position - 1];

  const related = posts
    .filter((item) => item.slug !== post.slug)
    .sort((a, b) => {
      const overlap = (candidate) =>
        candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      return overlap(b) - overlap(a);
    })
    .slice(0, 3);

  const body = `<div class="wrap">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Beranda</a>
      <span aria-hidden="true">/</span>
      <a href="/blog/">Artikel</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${escapeHtml(post.title)}</span>
    </nav>

    <article class="article">
      <header class="article-head">
        ${tagList(post.tags)}
        <h1>${escapeHtml(post.title)}</h1>
        <p class="lead">${escapeHtml(post.description)}</p>
        <div class="article-meta">
          <span>Oleh <a href="${site.github}" target="_blank" rel="noopener">${escapeHtml(site.author)}</a></span>
          <span aria-hidden="true">·</span>
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>${readingTime(post.body)} menit baca</span>
          ${post.updated && post.updated !== post.date ? `<span aria-hidden="true">·</span><span>Diperbarui ${formatDate(post.updated)}</span>` : ''}
        </div>
      </header>

      <div class="article-body">
        ${post.body}
      </div>

      <footer class="article-footer">
        <div class="cta cta-compact">
          <div>
            <h2>Butuh dokumentasi lengkap?</h2>
            <p>Lihat parameter, contoh request, dan coba endpoint langsung dari browser.</p>
          </div>
          <a class="button button-primary" href="${site.apiDocs}" target="_blank" rel="noopener">Buka dokumentasi API</a>
        </div>

        <nav class="post-nav" aria-label="Navigasi artikel">
          ${
            previous
              ? `<a href="/blog/${previous.slug}/"><span aria-hidden="true">←</span><span><small>Sebelumnya</small>${escapeHtml(previous.title)}</span></a>`
              : '<span></span>'
          }
          ${
            next
              ? `<a class="post-nav-next" href="/blog/${next.slug}/"><span><small>Berikutnya</small>${escapeHtml(next.title)}</span><span aria-hidden="true">→</span></a>`
              : '<span></span>'
          }
        </nav>
      </footer>
    </article>

    <section class="section related" aria-labelledby="related-title">
      <h2 id="related-title">Artikel terkait</h2>
      <div class="post-grid">
        ${related.map((item) => postCard(item)).join('\n        ')}
      </div>
    </section>
  </div>`;

  const url = absoluteUrl(`/blog/${post.slug}/`);
  return layout({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}/`,
    body,
    type: 'article',
    schema: [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        headline: post.title,
        description: post.description,
        image: site.ogImage,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        inLanguage: site.language,
        author: { '@id': `${site.url}/#person` },
        publisher: { '@id': `${site.url}/#person` },
        articleSection: post.tags.join(', '),
        keywords: [...post.tags, 'PuruBoy', 'PuruBoy API'].join(', '),
        isPartOf: { '@id': `${site.url}/#website` },
      },
      breadcrumbSchema([
        { name: 'Beranda', path: '/' },
        { name: 'Artikel', path: '/blog/' },
        { name: post.title, path: `/blog/${post.slug}/` },
      ]),
    ],
  });
}

function projectsPage() {
  const body = `<section class="wrap page-head">
    <p class="eyebrow">Portofolio</p>
    <h1>Proyek PuruBoy</h1>
    <p class="lead">Alat yang saya bangun dan pelihara. Semua proyek utama tersedia sebagai open source di GitHub.</p>
  </section>
  <section class="wrap section" aria-label="Daftar proyek">
    <div class="project-grid">
      ${projects.map((project) => projectCard(project)).join('\n      ')}
    </div>
  </section>
  <section class="wrap section">
    <div class="cta">
      <div>
        <h2>Punya ide kolaborasi?</h2>
        <p>Buka issue di GitHub atau sapa lewat Telegram. Saya terbuka untuk diskusi seputar API, AI, dan tool otomasi.</p>
      </div>
      <div class="button-row">
        <a class="button button-primary" href="${site.telegram}" target="_blank" rel="noopener">Telegram</a>
        <a class="button" href="${site.github}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </section>`;

  return layout({
    title: 'Proyek — PuruBoy Blog',
    description:
      'Proyek open source PuruBoy: PuruBoy API (REST API gratis) dan PuruClaw/PURU-AI (asisten AI Telegram), plus rencana proyek berikutnya.',
    path: '/projects/',
    body,
    schema: [
      {
        '@type': 'CollectionPage',
        url: absoluteUrl('/projects/'),
        name: 'Proyek PuruBoy',
        isPartOf: { '@id': `${site.url}/#website` },
        about: { '@id': `${site.url}/#person` },
      },
    ],
  });
}

function aboutPage() {
  const body = `<section class="wrap page-head">
    <p class="eyebrow">Tentang</p>
    <h1>Halo, saya Ricky Purwanto (PuruBoy).</h1>
    <p class="lead">Dikenal juga sebagai PuruBoy. Saya membangun alat web, API, dan otomasi AI dari Indonesia. Blog ini adalah tempat menulis prosesnya.</p>
  </section>
  <section class="wrap section prose">
    <h2>Kenapa blog ini ada?</h2>
    <p>Banyak developer menemukan PuruBoy API lewat dokumentasi, tetapi dokumentasi tidak selalu tempat yang nyaman untuk menjelaskan konteks, contoh nyata, atau alasan di balik keputusan teknis. Blog ini mengisi celah itu: tutorial yang bisa diikuti, catatan rilis, dan update proyek.</p>

    <h2>Yang saya kerjakan</h2>
    <ul>
      <li><strong>PuruBoy API</strong> — REST API gratis untuk AI, downloader, konten anime/manga, dan tools developer.</li>
      <li><strong>PuruClaw (PURU-AI)</strong> — asisten AI Telegram self-hosted berbasis Go.</li>
      <li><strong>Eksperimen berikutnya</strong> — prototipe seputar API, otomasi, dan AI yang akan diumumkan lewat blog.</li>
    </ul>

    <h2>Prinsip kerja</h2>
    <p>Saya suka solusi yang sederhana, bisa dibaca orang lain, dan tidak mengunci pengguna pada satu platform. Itulah sebabnya banyak proyek di sini open source dan memakai teknologi yang mudah di-deploy sendiri.</p>

    <h2>Kontak</h2>
    <p>Untuk pertanyaan, kolaborasi, atau laporan bug, gunakan salah satu kanal berikut:</p>
    <div class="button-row">
      <a class="button button-primary" href="${site.telegram}" target="_blank" rel="noopener">Telegram @puruboy_hub</a>
      <a class="button" href="${site.github}" target="_blank" rel="noopener">GitHub</a>
      <a class="button" href="${site.apiDocs}" target="_blank" rel="noopener">Dokumentasi API</a>
    </div>
  </section>`;

  return layout({
    title: 'Tentang — PuruBoy Blog',
    description:
      'Tentang Ricky Purwanto (PuruBoy): developer web, API, dan AI dari Indonesia. Kenali proyek, prinsip kerja, dan cara menghubungi.',
    path: '/about/',
    body,
    schema: [
      {
        '@type': 'AboutPage',
        url: absoluteUrl('/about/'),
        name: 'Tentang Ricky Purwanto (PuruBoy)',
        mainEntity: { '@id': `${site.url}/#person` },
        isPartOf: { '@id': `${site.url}/#website` },
      },
    ],
  });
}

function notFoundPage() {
  const body = `<section class="wrap page-head">
    <p class="eyebrow">404</p>
    <h1>Halaman tidak ditemukan.</h1>
    <p class="lead">Tautan mungkin sudah berubah atau salah ketik. Coba mulai dari halaman utama atau arsip artikel.</p>
    <div class="button-row">
      <a class="button button-primary" href="/">Beranda</a>
      <a class="button" href="/blog/">Lihat artikel</a>
    </div>
  </section>`;

  return layout({
    title: 'Halaman tidak ditemukan — PuruBoy Blog',
    description: 'Halaman yang kamu cari tidak tersedia.',
    path: '/404.html',
    body,
    noindex: true,
  });
}

async function writePage(path, html) {
  const relative = path === '/' ? 'index.html' : join(path.replace(/^\//, ''), 'index.html');
  const target = join(dist, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
}

function sitemap(pages) {
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function rssFeed() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const items = sorted
    .map(
      (post) => `    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${absoluteUrl(`/blog/${post.slug}/`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/blog/${post.slug}/`)}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeHtml(post.description)}</description>
      <category>${escapeHtml(post.tags.join(', '))}</category>
    </item>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(site.name)}</title>
    <link>${site.url}/</link>
    <description>${escapeHtml(site.description)}</description>
    <language>${site.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

const manifest = `{
  "name": "${site.name}",
  "short_name": "PuruBoy",
  "description": "${site.description}",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "${site.themeColor}",
  "theme_color": "${site.themeColor}",
  "lang": "${site.language}",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ]
}
`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="PuruBoy">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#60a5fa"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#0b1020"/>
  <path d="M36 6 16 36h13l-1 22 20-30H35l1-22Z" fill="url(#g)"/>
</svg>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`;

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  // Copy deploy-only files (CNAME) and optional public assets.
  await cp(join(root, 'public'), dist, { recursive: true, force: true });

  const latestPostDate = posts
    .map((post) => post.updated ?? post.date)
    .sort()
    .at(-1);

  await writePage('/', homePage());
  await writePage('/blog/', blogIndexPage());
  for (const post of posts) {
    await writePage(`/blog/${post.slug}/`, postPage(post));
  }
  await writePage('/projects/', projectsPage());
  await writePage('/about/', aboutPage());
  await writeFile(join(dist, '404.html'), notFoundPage(), 'utf8');

  const styles = await readFile(join(root, 'src', 'styles.css'), 'utf8');
  await writeFile(join(dist, 'styles.css'), styles, 'utf8');
  await writeFile(join(dist, 'icon.svg'), icon, 'utf8');
  await writeFile(join(dist, 'manifest.webmanifest'), manifest, 'utf8');
  await writeFile(join(dist, 'robots.txt'), robots, 'utf8');
  await writeFile(
    join(dist, 'sitemap.xml'),
    sitemap([
      { path: '/', lastmod: latestPostDate, changefreq: 'weekly', priority: '1.0' },
      { path: '/blog/', lastmod: latestPostDate, changefreq: 'weekly', priority: '0.9' },
      ...posts.map((post) => ({
        path: `/blog/${post.slug}/`,
        lastmod: post.updated ?? post.date,
        changefreq: 'monthly',
        priority: '0.8',
      })),
      { path: '/projects/', lastmod: latestPostDate, changefreq: 'monthly', priority: '0.6' },
      { path: '/about/', lastmod: latestPostDate, changefreq: 'yearly', priority: '0.5' },
    ]),
    'utf8',
  );
  await writeFile(join(dist, 'rss.xml'), rssFeed(), 'utf8');

  console.log(`[build] ${posts.length} posts, ${posts.length + 4} pages -> dist/`);
}

await build();
