/**
 * Site metadata and blog content.
 *
 * Posts are plain HTML so the build stays dependency-free. Keep every link
 * absolute or root-relative; the generator turns them into static pages.
 */

export const site = {
  url: 'https://puruboy.duckdns.org',
  name: 'PuruBoy Blog',
  tagline: 'Catatan proyek, tutorial API, dan cerita di balik layar.',
  description:
    'Blog resmi PuruBoy: tutorial PuruBoy API, panduan AI chat, downloader, dan update proyek open source untuk developer Indonesia.',
  author: 'Ricky Purwanto (PuruBoy)',
  authorUrl: 'https://github.com/purujawa06-bot',
  github: 'https://github.com/purujawa06-bot',
  telegram: 'https://t.me/puruboy_hub',
  apiDocs: 'https://na-api.puruboy.duckdns.org/docs/',
  apiBase: 'https://na-api-nue-api-e7bfd3f4.koyeb.app',
  apiRepo: 'https://github.com/purujawa06-bot/Na-api',
  puruClawRepo: 'https://github.com/purujawa06-bot/PURU-AI',
  ogImage:
    'https://raw.githubusercontent.com/purujawa06-bot/Na-media/main/puruboy-ch.jpg',
  language: 'id',
  locale: 'id_ID',
  themeColor: '#0b1020',
};

export const posts = [
  {
    slug: 'apa-itu-puruboy-api',
    title: 'Apa Itu PuruBoy API? REST API Gratis untuk Developer Indonesia',
    description:
      'PuruBoy API adalah kumpulan REST API gratis untuk AI chat, downloader, anime, manga, dan tools developer. Kenali fitur, cara akses, dan batasannya di sini.',
    date: '2026-11-06',
    updated: '2026-11-06',
    tags: ['PuruBoy API', 'REST API', 'Developer Indonesia'],
    featured: true,
    body: `
      <p class="lead">PuruBoy API adalah platform REST API gratis yang menyatukan layanan AI, downloader media, konten anime dan manga, serta tools developer dalam satu dokumentasi. Artikel ini menjelaskan apa yang bisa kamu lakukan, bagaimana cara mengaksesnya, dan hal yang perlu diperhatikan sebelum memakainya di proyek produksi.</p>

      <h2 id="ringkasan">Ringkasan singkat</h2>
      <ul>
        <li><strong>Gratis untuk endpoint publik</strong> dan tidak memerlukan API key untuk sebagian besar layanan.</li>
        <li><strong>Dokumentasi interaktif</strong> dengan fitur <em>Try It Out</em> di <a href="${site.apiDocs}">na-api.puruboy.duckdns.org/docs</a>.</li>
        <li><strong>Backend Go</strong> yang berjalan di Koyeb, terpisah dari frontend statis di GitHub Pages.</li>
        <li><strong>Rate limit</strong> 100 request per menit per IP agar layanan tetap stabil untuk semua orang.</li>
      </ul>

      <h2 id="fitur">Apa saja yang tersedia?</h2>
      <h3>1. AI chat dan model</h3>
      <p>Endpoint <code>/api/chat/completions</code> memakai format yang kompatibel dengan OpenAI, sehingga kamu bisa memakai SDK OpenAI dengan base URL khusus. Tersedia juga endpoint DeepSeek untuk chat instan, reasoning, dan vision, serta registry model di <code>/api/models</code>.</p>

      <h3>2. Downloader media</h3>
      <p>Ambil tautan media publik dari TikTok, YouTube, Instagram, dan SoundCloud. Endpoint downloader mengembalikan metadata sekaligus URL unduhan langsung, sehingga kamu bisa memprosesnya di aplikasi atau bot sendiri.</p>

      <h3>3. Nonton dan baca</h3>
      <p>Ada endpoint untuk DramaBox, Komiku, dan PurTV: home, pencarian, kategori, detail, hingga chapter atau episode. Cocok untuk eksperimen aplikasi katalog konten, bukan untuk menggantikan layanan resmi.</p>

      <h3>4. Tools gambar dan utilitas</h3>
      <p>Upscaler gambar, remove background, HTML-to-image, uploader ImgBB, web search, dan web fetch. Beberapa endpoint tools mengembalikan streaming NDJSON dengan event <code>processing</code> sampai proses selesai.</p>

      <h2 id="arsitektur">Arsitektur singkat</h2>
      <p>Frontend PuruBoy API adalah aplikasi Next.js yang diekspor sebagai situs statis dan di-deploy ke GitHub Pages. Semua panggilan API diarahkan langsung ke backend Go yang berjalan di Koyeb. Pemisahan ini membuat frontend cepat dibuka dan backend bisa diskalakan terpisah.</p>
      <p>Karena browser memanggil backend secara langsung, CORS ditangani di sisi Go. Tidak ada proxy di Next.js dan tidak ada route API di domain frontend.</p>

      <h2 id="mulai">Cara mulai memakai PuruBoy API</h2>
      <ol>
        <li>Buka <a href="${site.apiDocs}">dokumentasi interaktif</a> dan pilih kategori endpoint.</li>
        <li>Gunakan tombol <em>Try It Out</em> untuk menguji request langsung dari browser.</li>
        <li>Salin contoh kode <code>fetch</code> atau <code>curl</code> ke proyekmu.</li>
        <li>Tambahkan penanganan error dan batas retry agar aplikasi tetap ramah saat layanan sibuk.</li>
      </ol>

      <h3>Contoh: mengambil daftar model</h3>
      <pre><code>curl ${site.apiBase}/api/models</code></pre>

      <h3>Contoh: chat sederhana</h3>
      <pre><code>curl ${site.apiBase}/api/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      { "role": "user", "content": "Jelaskan REST API dalam satu paragraf." }
    ]
  }'</code></pre>

      <h2 id="batasan">Batasan dan etika pemakaian</h2>
      <ul>
        <li>Gunakan hanya untuk konten publik dan hormati hak cipta pemilik konten.</li>
        <li>Jangan menghapus rate limit atau membanjiri endpoint dengan request paralel yang berlebihan.</li>
        <li>Link CDN hasil downloader biasanya kedaluwarsa sekitar satu jam, jadi unduh atau teruskan segera.</li>
        <li>Untuk endpoint yang membutuhkan token pribadi (misalnya DeepSeek), jangan pernah menaruh token di kode frontend publik.</li>
      </ul>

      <h2 id="kesimpulan">Kesimpulan</h2>
      <p>PuruBoy API cocok untuk prototipe cepat, bot, dashboard internal, dan eksperimen developer yang ingin menghemat waktu integrasi. Mulai dari dokumentasi, pilih satu endpoint, lalu kembangkan dari sana.</p>
      <p>Lanjutkan dengan <a href="/blog/cara-memakai-puruboy-api/">panduan cepat memakai PuruBoy API</a> atau lihat <a href="/blog/ai-chat-api-gratis/">panduan AI chat API</a>.</p>
    `,
  },
  {
    slug: 'cara-memakai-puruboy-api',
    title: 'Cara Memakai PuruBoy API: Panduan Cepat dari Models sampai Chat',
    description:
      'Tutorial PuruBoy API: ambil daftar model, kirim chat completions dengan curl, JavaScript, dan Python, plus streaming dan penanganan error.',
    date: '2026-11-05',
    updated: '2026-11-06',
    tags: ['Tutorial', 'PuruBoy API', 'JavaScript'],
    body: `
      <p class="lead">Panduan ini menunjukkan alur paling cepat untuk memakai PuruBoy API: cek model yang tersedia, kirim pesan pertama, lalu tangani respons streaming dan error. Semua contoh memakai endpoint publik tanpa API key.</p>

      <h2 id="prasyarat">Prasyarat</h2>
      <ul>
        <li>Node.js 18+ atau Python 3.9+ untuk menjalankan contoh.</li>
        <li>Koneksi internet biasa. Tidak perlu mendaftar akun.</li>
        <li>Pemahaman dasar HTTP dan JSON akan sangat membantu.</li>
      </ul>

      <h2 id="base-url">Base URL dan dokumentasi</h2>
      <p>Gunakan base URL backend berikut untuk semua contoh di artikel ini:</p>
      <pre><code>${site.apiBase}</code></pre>
      <p>Daftar endpoint lengkap, parameter, dan contoh respons ada di <a href="${site.apiDocs}">dokumentasi interaktif PuruBoy API</a>. Jika URL backend berubah, dokumentasi adalah sumber paling akurat.</p>

      <h2 id="models">Langkah 1: cek model yang tersedia</h2>
      <pre><code>curl ${site.apiBase}/api/models</code></pre>
      <p>Respons mengikuti format daftar model ala OpenAI. Pilih ID model yang kamu butuhkan, atau gunakan <code>auto</code> agar backend memilih model dari rantai fallback.</p>
      <pre><code>const response = await fetch('${site.apiBase}/api/models');
const data = await response.json();
console.log(data);</code></pre>

      <h2 id="chat">Langkah 2: kirim chat pertama</h2>
      <h3>Dengan curl</h3>
      <pre><code>curl ${site.apiBase}/api/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      { "role": "system", "content": "Jawab singkat dan jelas." },
      { "role": "user", "content": "Apa itu API?" }
    ]
  }'</code></pre>

      <h3>Dengan JavaScript</h3>
      <pre><code>const response = await fetch('${site.apiBase}/api/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'auto',
    messages: [{ role: 'user', content: 'Apa itu API?' }],
  }),
});

if (!response.ok) {
  throw new Error('Request gagal: ' + response.status);
}

const data = await response.json();
console.log(data.choices[0].message.content);</code></pre>

      <h3>Dengan Python</h3>
      <pre><code>import requests

response = requests.post(
    '${site.apiBase}/api/chat/completions',
    json={
        'model': 'auto',
        'messages': [{'role': 'user', 'content': 'Apa itu API?'}],
    },
    timeout=60,
)
response.raise_for_status()
print(response.json()['choices'][0]['message']['content'])</code></pre>

      <h2 id="streaming">Langkah 3: aktifkan streaming</h2>
      <p>Tambahkan <code>"stream": true</code> untuk menerima Server-Sent Events (SSE). Cocok untuk aplikasi chat yang ingin menampilkan jawaban sambil ditulis.</p>
      <pre><code>const response = await fetch('${site.apiBase}/api/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'auto',
    stream: true,
    messages: [{ role: 'user', content: 'Tulis puisi pendek tentang hujan.' }],
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  process.stdout.write(decoder.decode(value));
}</code></pre>

      <h2 id="downloader">Langkah 4: coba downloader</h2>
      <p>Contoh mengambil metadata video TikTok publik:</p>
      <pre><code>curl "${site.apiBase}/api/downloader/tiktok?url=https%3A%2F%2Fwww.tiktok.com%2F%40username%2Fvideo%2F1234567890"</code></pre>
      <p>Hanya URL <code>https</code> yang diterima. Link media yang dikembalikan biasanya kedaluwarsa sekitar satu jam, jadi segera unduh atau teruskan ke pengguna.</p>

      <h2 id="error">Menangani error dan rate limit</h2>
      <ul>
        <li>Periksa <code>response.ok</code> sebelum membaca JSON.</li>
        <li>Terapkan timeout, misalnya 30–60 detik untuk chat dan lebih lama untuk endpoint media.</li>
        <li>Hormati batas 100 request per menit per IP. Tambahkan backoff eksponensial saat menerima status 429.</li>
        <li>Jangan retry otomatis untuk error 4xx selain 429 karena biasanya masalah input.</li>
      </ul>

      <h2 id="lanjut">Langkah berikutnya</h2>
      <p>Setelah chat berjalan, coba integrasikan endpoint downloader, tools gambar, atau DeepSeek. Baca juga <a href="/blog/downloader-tiktok-youtube-api/">panduan downloader</a> dan <a href="/blog/ai-chat-api-gratis/">panduan memilih model AI</a>.</p>
      <p>Butuh dokumentasi parameter lengkap? Buka <a href="${site.apiDocs}">dokumentasi PuruBoy API</a>.</p>
    `,
  },
  {
    slug: 'downloader-tiktok-youtube-api',
    title: 'Downloader TikTok, YouTube, Instagram & SoundCloud via API',
    description:
      'Panduan endpoint downloader PuruBoy API untuk TikTok, YouTube, Instagram, dan SoundCloud: parameter, contoh request, dan tips integrasi aman.',
    date: '2026-11-04',
    updated: '2026-11-06',
    tags: ['Downloader', 'TikTok', 'YouTube', 'PuruBoy API'],
    body: `
      <p class="lead">PuruBoy API menyediakan empat endpoint downloader untuk mengambil metadata dan tautan media publik. Artikel ini merangkum parameter penting, contoh request, dan hal yang sering membuat integrasi gagal.</p>

      <h2 id="daftar">Daftar endpoint</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Platform</th><th>Endpoint</th><th>Parameter wajib</th></tr>
          </thead>
          <tbody>
            <tr><td>TikTok</td><td><code>GET /api/downloader/tiktok</code></td><td><code>url</code></td></tr>
            <tr><td>YouTube</td><td><code>GET /api/downloader/youtube</code></td><td><code>url</code></td></tr>
            <tr><td>Instagram</td><td><code>GET /api/downloader/instagram</code></td><td><code>url</code></td></tr>
            <tr><td>SoundCloud</td><td><code>GET /api/downloader/soundcloud</code></td><td><code>url</code></td></tr>
          </tbody>
        </table>
      </div>
      <p>Semua endpoint menerima URL <code>https</code> dari konten publik. Parameter tambahan untuk YouTube adalah <code>type</code> (<code>video</code> atau <code>audio</code>) dan <code>quality</code> (144 sampai 1080).</p>

      <h2 id="tiktok">TikTok tanpa watermark</h2>
      <pre><code>curl "${site.apiBase}/api/downloader/tiktok?url=https%3A%2F%2Fwww.tiktok.com%2F%40username%2Fvideo%2F1234567890"</code></pre>
      <p>Respons berisi metadata seperti author, avatar, caption, tautan video tanpa watermark, dan tautan MP3. Endpoint ini juga menerima method POST dengan body JSON <code>{"url":"..."}</code>.</p>

      <h2 id="youtube">YouTube video atau audio</h2>
      <pre><code>curl "${site.apiBase}/api/downloader/youtube?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DVIDEO_ID&amp;type=audio"</code></pre>
      <p>Gunakan <code>type=audio</code> untuk MP3 dan <code>quality=360</code> atau <code>720</code> untuk video. Respons menyertakan judul, thumbnail, durasi, serta daftar kualitas yang tersedia.</p>

      <h2 id="instagram">Instagram Reels dan Post</h2>
      <pre><code>curl "${site.apiBase}/api/downloader/instagram?url=https%3A%2F%2Fwww.instagram.com%2Freel%2FKODE_REEL%2F"</code></pre>
      <p>Mendukung tautan <code>/p/</code>, <code>/reel/</code>, <code>/reels/</code>, <code>/tv/</code>, dan <code>/share/</code>. Untuk carousel, endpoint dapat mengembalikan beberapa media sekaligus.</p>

      <h2 id="soundcloud">SoundCloud MP3</h2>
      <pre><code>curl "${site.apiBase}/api/downloader/soundcloud?url=https%3A%2F%2Fsoundcloud.com%2Fartist%2Ftrack"</code></pre>
      <p>Respons berisi metadata dan tautan stream. Track tertentu dapat mengembalikan preview 30 detik dengan penanda <code>is_preview=true</code>.</p>

      <h2 id="integrasi">Tips integrasi</h2>
      <ul>
        <li><strong>Jangan tampilkan URL CDN mentah ke pengguna</strong> jika kamu ingin kontrol penuh. Stream lewat backend sendiri agar bisa menangani kedaluwarsa dan otorisasi.</li>
        <li><strong>Cache metadata</strong> dalam waktu singkat untuk mengurangi request berulang.</li>
        <li><strong>Validasi URL di server</strong> sebelum meneruskannya ke API. Tolak skema selain HTTPS.</li>
        <li><strong>Tangani kegagalan upstream</strong> dengan pesan yang ramah, bukan error mentah dari platform sumber.</li>
        <li><strong>Hormati hak cipta</strong> dan syarat layanan masing-masing platform. Gunakan untuk konten yang kamu berhak akses atau simpan.</li>
      </ul>

      <h2 id="kesimpulan">Kesimpulan</h2>
      <p>Empat endpoint downloader ini bisa menjadi fondasi bot, aplikasi penyimpanan konten pribadi, atau alat riset media sosial. Mulai dari satu platform, uji dengan beberapa URL, lalu tambahkan penanganan error sebelum dipakai banyak pengguna.</p>
      <p>Detail parameter selalu diperbarui di <a href="${site.apiDocs}">dokumentasi PuruBoy API</a>. Untuk integrasi chat, baca <a href="/blog/cara-memakai-puruboy-api/">panduan cepat PuruBoy API</a>.</p>
    `,
  },
  {
    slug: 'ai-chat-api-gratis',
    title: 'AI Chat API Gratis: DeepSeek, Gemini, GPT, dan Cara Memilih Model',
    description:
      'Kenali endpoint AI PuruBoy API: chat completions kompatibel OpenAI, registry model, DeepSeek instant, reasoning, vision, streaming, dan tips memilih model.',
    date: '2026-11-02',
    updated: '2026-11-06',
    tags: ['AI', 'DeepSeek', 'Gemini', 'PuruBoy API'],
    body: `
      <p class="lead">PuruBoy API menyediakan beberapa jalur untuk memakai model AI: endpoint chat yang kompatibel OpenAI, registry model dinamis, serta endpoint DeepSeek khusus. Panduan ini membantu kamu memilih jalur yang tepat tanpa membuat arsitektur terlalu rumit.</p>

      <h2 id="pilihan">Tiga cara memakai AI di PuruBoy API</h2>
      <ol>
        <li><strong>Chat completions</strong> — satu endpoint untuk banyak model, format OpenAI, mendukung streaming dan function calling.</li>
        <li><strong>DeepSeek instant, reasoning, dan vision</strong> — akses langsung ke chat.deepseek.com memakai token akun pribadi.</li>
        <li><strong>Registry model</strong> — daftar model yang bisa dipakai, diambil dari satu sumber yang sama dengan panel admin.</li>
      </ol>

      <h2 id="registry">Mulai dari registry model</h2>
      <pre><code>curl ${site.apiBase}/api/models</code></pre>
      <p>Gunakan ID model yang muncul di respons. Jika bingung, pilih <code>auto</code>: backend akan mencoba model dalam rantai fallback sampai mendapat jawaban yang valid.</p>

      <h2 id="openai">Chat completions yang kompatibel OpenAI</h2>
      <p>Endpoint <code>/api/chat/completions</code> menerima format <code>messages</code> yang sama seperti OpenAI. Kamu bisa memakai SDK OpenAI dengan base URL custom:</p>
      <pre><code>import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: '${site.apiBase}/api',
  apiKey: 'not-needed',
});

const result = await client.chat.completions.create({
  model: 'auto',
  messages: [{ role: 'user', content: 'Halo!' }],
});

console.log(result.choices[0].message.content);</code></pre>

      <h3>Streaming</h3>
      <p>Tambahkan <code>stream: true</code> untuk menerima SSE. Ini pilihan terbaik untuk antarmuka chat karena pengguna melihat jawaban lebih cepat.</p>

      <h3>Function calling</h3>
      <p>Endpoint mendukung definisi <code>tools</code> format OpenAI. Tool call diemulasi melalui protokol XML, sehingga tetap berguna untuk agen sederhana. Untuk tugas coding kompleks, gunakan model dan alat yang memang dirancang untuk itu.</p>

      <h2 id="deepseek">Kapan memakai endpoint DeepSeek?</h2>
      <p>Endpoint DeepSeek memakai token akun <code>chat.deepseek.com</code> milikmu (nilai <code>userToken</code> di localStorage). Jangan pernah menaruh token ini di frontend publik.</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Endpoint</th><th>Cocok untuk</th><th>Catatan</th></tr>
          </thead>
          <tbody>
            <tr><td><code>/api/deepseek/instant</code></td><td>Chat cepat tanpa thinking</td><td>Butuh <code>userID</code> (token)</td></tr>
            <tr><td><code>/api/deepseek/reasoning</code></td><td>Soal yang butuh penalaran</td><td>Respons lebih lambat</td></tr>
            <tr><td><code>/api/deepseek/vision</code></td><td>Memahami gambar</td><td>Kirim gambar yang dapat diakses publik</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="memilih">Cara memilih model</h2>
      <ul>
        <li><strong>Chat umum dan ringkasan:</strong> mulai dari <code>auto</code> atau model cepat.</li>
        <li><strong>Penalaran bertahap:</strong> gunakan model reasoning, tapi siapkan timeout lebih panjang.</li>
        <li><strong>Gambar:</strong> pilih endpoint vision, bukan chat teks biasa.</li>
        <li><strong>Prototipe:</strong> <code>auto</code> menghemat waktu karena kamu tidak perlu mengunci satu model.</li>
      </ul>

      <h2 id="produksi">Checklist sebelum produksi</h2>
      <ul>
        <li>Simpan token dan kredensial di server, bukan di bundle frontend.</li>
        <li>Batasi panjang input dan output untuk mengendalikan biaya serta latensi.</li>
        <li>Terapkan timeout, retry terbatas, dan fallback yang jelas.</li>
        <li>Catat request ID atau pesan error agar debugging lebih mudah.</li>
        <li>Uji perilaku saat model mengembalikan jawaban kosong atau tool call yang tidak valid.</li>
      </ul>

      <h2 id="kesimpulan">Kesimpulan</h2>
      <p>Untuk sebagian besar aplikasi, mulai dari <code>/api/chat/completions</code> dengan model <code>auto</code> adalah pilihan paling sederhana. Baru pindah ke endpoint DeepSeek atau model tertentu ketika kebutuhanmu sudah jelas.</p>
      <p>Lihat daftar model dan parameter terbaru di <a href="${site.apiDocs}">dokumentasi PuruBoy API</a>, atau baca <a href="/blog/cara-memakai-puruboy-api/">panduan integrasi langkah demi langkah</a>.</p>
    `,
  },
  {
    slug: 'puruclaw-asisten-ai-telegram',
    title: 'PuruClaw (PURU-AI): Asisten AI Telegram Self-Hosted',
    description:
      'PuruClaw (PURU-AI) adalah asisten AI Telegram open source berbasis Go dengan tools lokal, skills, dan memori. Kenali fitur dan cara memulainya.',
    date: '2026-10-30',
    updated: '2026-11-06',
    tags: ['PuruClaw', 'PURU-AI', 'Telegram', 'Go'],
    body: `
      <p class="lead">PuruClaw, yang juga dikenal sebagai PURU-AI, adalah asisten AI Telegram open source yang ditulis dalam Go. Fokusnya bukan sekadar membalas pesan: ia dirancang sebagai operator workspace dengan tools lokal, skills, dan memori yang bisa kamu jalankan sendiri.</p>

      <h2 id="apa-itu">Apa itu PuruClaw?</h2>
      <p>PuruClaw adalah bot Telegram yang menghubungkan model AI dengan kemampuan nyata di servermu. Karena berjalan sendiri, kamu memegang kendali atas data, kredensial, dan tools yang tersedia. Proyek ini terbuka di GitHub dan cocok untuk eksperimen agen AI yang tidak ingin bergantung pada satu platform SaaS.</p>

      <h2 id="fitur">Fitur utama</h2>
      <ul>
        <li><strong>Ditulis dalam Go</strong> — binary ringan, mudah di-deploy di VPS atau container.</li>
        <li><strong>Tools lokal</strong> — menjalankan aksi di workspace, bukan hanya menghasilkan teks.</li>
        <li><strong>Skills</strong> — kemampuan tambahan yang bisa diaktifkan sesuai kebutuhan.</li>
        <li><strong>Memori</strong> — konteks percakapan yang membantu tugas berulang.</li>
        <li><strong>Open source</strong> — kode bisa diaudit, dimodifikasi, dan di-host sendiri.</li>
      </ul>

      <h2 id="cocok">Siapa yang cocok memakainya?</h2>
      <p>PuruClaw cocok untuk developer yang ingin memahami cara kerja agen AI Telegram dari dalam, tim kecil yang butuh asisten internal, atau siapa pun yang ingin bereksperimen dengan tools dan memori tanpa menyerahkan data ke layanan pihak ketiga.</p>
      <p>Jika kamu hanya butuh chat AI sederhana, PuruBoy API sudah cukup. PuruClaw masuk akal ketika kamu membutuhkan integrasi Telegram, akses workspace, dan kustomisasi tools.</p>

      <h2 id="mulai">Cara memulai</h2>
      <ol>
        <li>Buka repositori <a href="${site.puruClawRepo}">PURU-AI di GitHub</a>.</li>
        <li>Baca instruksi instalasi dan siapkan token bot Telegram.</li>
        <li>Atur kredensial model AI di environment, jangan di kode.</li>
        <li>Jalankan di VPS atau container, lalu uji dengan satu tools sederhana.</li>
      </ol>

      <h2 id="ekosistem">Hubungannya dengan PuruBoy API</h2>
      <p>PuruBoy API dan PuruClaw adalah dua proyek yang saling melengkapi. PuruBoy API menyediakan endpoint AI dan utilitas berbasis HTTP, sedangkan PuruClaw adalah contoh aplikasi yang bisa memakai layanan tersebut di lingkungan Telegram. Ke depan, dokumentasi dan tutorial akan terus ditambahkan di blog ini.</p>

      <h2 id="kesimpulan">Kesimpulan</h2>
      <p>PuruClaw menunjukkan arah proyek PuruBoy: alat yang praktis, terbuka, dan bisa dijalankan sendiri. Kalau kamu tertarik dengan agen AI Telegram, repositori PURU-AI adalah titik mulai yang jujur dan bisa dibaca kodenya.</p>
      <p>Lihat juga <a href="/projects/">halaman proyek</a> untuk update PuruBoy API dan proyek berikutnya.</p>
    `,
  },
  {
    slug: 'roadmap-proyek-puruboy',
    title: 'Roadmap Proyek PuruBoy: Apa Saja yang Sedang Dibangun?',
    description:
      'Update roadmap proyek PuruBoy: pengembangan PuruBoy API, PuruClaw, dokumentasi, dan rencana proyek berikutnya. Ikuti perkembangannya lewat GitHub dan Telegram.',
    date: '2026-10-28',
    updated: '2026-11-06',
    tags: ['Roadmap', 'PuruBoy', 'Open Source'],
    body: `
      <p class="lead">Blog ini dibuat bukan hanya untuk tutorial, tetapi juga untuk mencatat perjalanan proyek. Berikut gambaran roadmap PuruBoy saat ini: apa yang sudah berjalan, apa yang sedang dirapikan, dan bagaimana kamu bisa mengikuti update berikutnya.</p>

      <h2 id="sekarang">Yang sudah berjalan</h2>
      <h3>PuruBoy API</h3>
      <p>Backend Go sudah melayani endpoint AI, downloader, anime dan manga, tools gambar, uploader, serta dokumentasi interaktif. Frontend statis dan API dipisahkan agar mudah di-deploy dan dirawat. Fokus berikutnya adalah stabilitas, kualitas dokumentasi, dan pengalaman <em>Try It Out</em>.</p>

      <h3>PuruClaw (PURU-AI)</h3>
      <p>Asisten AI Telegram self-hosted sudah tersedia di GitHub. Pengembangan berlanjut pada tools, skills, dan memori yang lebih rapi, tanpa mengorbankan kemudahan instalasi.</p>

      <h2 id="sedang">Yang sedang dirapikan</h2>
      <ul>
        <li><strong>Dokumentasi:</strong> contoh request yang konsisten, penjelasan parameter, dan catatan batasan tiap endpoint.</li>
        <li><strong>Konten edukasi:</strong> tutorial berbahasa Indonesia yang bisa diikuti tanpa asumsi latar belakang tertentu.</li>
        <li><strong>Kestabilan layanan:</strong> penanganan error, timeout, dan fallback yang lebih mudah dipahami pengguna.</li>
        <li><strong>SEO dan aksesibilitas:</strong> halaman statis yang cepat, struktur data terstruktur, dan navigasi yang ramah pembaca.</li>
      </ul>

      <h2 id="berikutnya">Rencana berikutnya</h2>
      <p>Beberapa ide yang sedang dipertimbangkan:</p>
      <ul>
        <li>Panduan integrasi SDK OpenAI dan framework populer.</li>
        <li>Contoh proyek nyata: bot Telegram, dashboard, dan aplikasi web kecil.</li>
        <li>Halaman status dan changelog yang mudah dipantau.</li>
        <li>Konten seputar Arsitektur Go, deployment, dan praktik API yang aman.</li>
      </ul>
      <p>Rencana bisa berubah mengikuti waktu dan prioritas. Yang pasti, setiap proyek tetap open source dan bisa diikuti perkembangannya.</p>

      <h2 id="ikut">Cara mengikuti update</h2>
      <ul>
        <li>Star dan watch repositori <a href="${site.apiRepo}">Na-api</a> serta <a href="${site.puruClawRepo}">PURU-AI</a>.</li>
        <li>Gabung saluran Telegram <a href="${site.telegram}">@puruboy_hub</a>.</li>
        <li>Baca <a href="/blog/">blog</a> untuk tutorial dan catatan rilis.</li>
      </ul>

      <h2 id="kesimpulan">Kesimpulan</h2>
      <p>Roadmap ini hidup: prioritas bisa bergeser, tetapi arahnya tetap sama — membangun alat yang berguna, terdokumentasi, dan bisa dipelajari. Kalau ada fitur yang ingin kamu lihat, buka issue di GitHub.</p>
    `,
  },
];

export const projects = [
  {
    name: 'PuruBoy API',
    status: 'Aktif',
    statusClass: 'live',
    description:
      'REST API gratis untuk AI chat, downloader media, anime dan manga, tools gambar, serta utilitas developer. Backend Go, dokumentasi interaktif, dan endpoint publik tanpa API key.',
    tags: ['Go', 'REST API', 'AI', 'Downloader'],
    links: [
      { label: 'Buka dokumentasi', href: site.apiDocs, primary: true },
      { label: 'Repositori', href: site.apiRepo },
    ],
  },
  {
    name: 'PuruClaw (PURU-AI)',
    status: 'Open source',
    statusClass: 'live',
    description:
      'Asisten AI Telegram self-hosted berbasis Go dengan tools lokal, skills, dan memori. Cocok untuk eksperimen agen AI yang ingin dijalankan sendiri.',
    tags: ['Go', 'Telegram', 'AI Agent'],
    links: [
      { label: 'Buka repositori', href: site.puruClawRepo, primary: true },
      { label: 'Baca artikel', href: '/blog/puruclaw-asisten-ai-telegram/' },
    ],
  },
  {
    name: 'Proyek berikutnya',
    status: 'Dalam rancangan',
    statusClass: 'soon',
    description:
      'Eksperimen seputar API, otomasi, dan AI yang akan diumumkan lewat blog dan Telegram. Ikuti GitHub untuk melihat prototipe lebih awal.',
    tags: ['Riset', 'Prototipe'],
    links: [{ label: 'Ikuti GitHub', href: site.github, primary: true }],
  },
];
