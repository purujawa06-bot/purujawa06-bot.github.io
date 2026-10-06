import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distHtml = path.join(root, 'dist', 'index.html')

// Build sudah jalan (vite build) -> dist/index.html ada.
// Kita render App via SSR lalu suntik ke <div id="root">.
const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
})

try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
  const appHtml = render()

  let template = fs.readFileSync(distHtml, 'utf-8')

  const marker = /<div id="root"><\/div>/
  if (!marker.test(template)) {
    console.error('[prerender] marker <div id="root"></div> tidak ketemu di dist/index.html')
    process.exit(1)
  }

  const html = template.replace(
    marker,
    `<div id="root">${appHtml}</div>`,
  )

  fs.writeFileSync(distHtml, html)
  console.log(`[prerender] OK — static HTML disuntik (${appHtml.length} chars)`)
} finally {
  await vite.close()
}
