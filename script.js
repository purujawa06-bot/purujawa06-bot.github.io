function spaApp() {
    return {
        currentPage: 'home',
        statusMsg: 'Menginisialisasi...',
        myPeerId: '...',
        textContent: '',
        connectionCount: 0,
        peer: null,
        connections: [],

        init() {
            // Handle Routing
            const handleRoute = () => {
                const hash = window.location.hash.replace('#', '') || 'home';
                this.currentPage = hash;
                
                // Jika masuk ke editor dan peer belum siap, inisialisasi
                if (hash === 'editor' && !this.peer) {
                    this.initPeer();
                }
            };

            window.addEventListener('hashchange', handleRoute);
            handleRoute();

            // Cek jika ada parameter join di URL (format: ?join=ID#editor)
            const urlParams = new URLSearchParams(window.location.search);
            const joinId = urlParams.get('join');
            if (joinId) {
                window.location.hash = 'editor';
            }
        },

        initPeer() {
            this.peer = new Peer();

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                this.statusMsg = "Siap menerima koneksi";
                this.generateQRCode(id);
                
                // Cek ulang join ID setelah peer terbuka
                const urlParams = new URLSearchParams(window.location.search);
                const joinId = urlParams.get('join');
                if (joinId) {
                    this.statusMsg = "Menghubungkan ke " + joinId + "...";
                    const conn = this.peer.connect(joinId);
                    this.setupConnection(conn);
                }
            });

            this.peer.on('connection', (conn) => {
                this.setupConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error(err);
                this.statusMsg = "Error: " + err.type;
            });
        },

        generateQRCode(id) {
            const joinUrl = `${window.location.origin}${window.location.pathname}?join=${id}#editor`;
            const qrContainer = this.$refs.qrcode;
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: joinUrl,
                width: 150,
                height: 150
            });
        },

        setupConnection(conn) {
            conn.on('open', () => {
                if (!this.connections.find(c => c.peer === conn.peer)) {
                    this.connections.push(conn);
                    this.connectionCount = this.connections.length;
                }
                this.statusMsg = "Terhubung!";
                
                // Kirim teks saat ini ke rekan yang baru bergabung
                conn.send({ type: 'TEXT_UPDATE', data: this.textContent });
            });

            conn.on('data', (data) => {
                if (data.type === 'TEXT_UPDATE') {
                    this.textContent = data.data;
                } else if (data.type === 'CLEAR') {
                    this.textContent = '';
                }
            });

            conn.on('close', () => {
                this.connections = this.connections.filter(c => c.peer !== conn.peer);
                this.connectionCount = this.connections.length;
            });
        },

        broadcast(payload) {
            this.connections.forEach(conn => {
                if (conn.open) {
                    conn.send(payload);
                }
            });
        },

        handleInput() {
            this.broadcast({ type: 'TEXT_UPDATE', data: this.textContent });
        },

        clearText() {
            if (confirm('Hapus semua teks?')) {
                this.textContent = '';
                this.broadcast({ type: 'CLEAR' });
            }
        },

        copyText() {
            navigator.clipboard.writeText(this.textContent).then(() => {
                alert('Teks berhasil disalin!');
            });
        },

        copyJoinLink() {
            const joinUrl = `${window.location.origin}${window.location.pathname}?join=${this.myPeerId}#editor`;
            navigator.clipboard.writeText(joinUrl).then(() => {
                alert('Link kolaborasi berhasil disalin!');
            });
        }
    }
}