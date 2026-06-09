/**
 * Player.js - Optimized for Buffer Management and Zoom
 */

const Player = {
    currentZoom: 1,
    video: null,
    pc: null, // Menyimpan referensi RTCPeerConnection

    init(videoElement, peerConnection = null) {
        this.video = videoElement;
        if (peerConnection) this.pc = peerConnection;
        this.reset();
        // Force rendering kickstart
        if (this.video) {
            this.video.style.opacity = '0.99';
            setTimeout(() => { this.video.style.opacity = '1'; }, 50);
        }
    },

    setPC(peerConnection) {
        this.pc = peerConnection;
    },

    reset() {
        this.currentZoom = 1;
        if (this.video) {
            this.video.style.transform = 'scale(1)';
            this.video.style.objectFit = 'contain';
        }
    },

    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom + 0.2, 4.0);
        this.applyStyle();
        return this.currentZoom;
    },

    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom - 0.2, 0.5);
        this.applyStyle();
        return this.currentZoom;
    },

    applyStyle() {
        if (!this.video) return;
        this.video.style.transform = `scale(${this.currentZoom})`;
        this.video.style.transformOrigin = 'center center';
        this.video.style.transition = 'transform 0.15s ease-out';
    },

    toggleMute() {
        if (!this.video) return true;
        this.video.muted = !this.video.muted;
        // Some mobile browsers need explicit volume set after unmuting
        if (!this.video.muted) this.video.volume = 1.0;
        return this.video.muted;
    },

    /**
     * Mengatur playoutDelayHint & jitterBufferTarget pada RTCRtpReceiver.
     * Memastikan audio dan video mendapatkan nilai delay yang identik untuk mencegah drift/desync.
     */
    setPlayoutDelay(minMs) {
        if (!this.pc) {
            console.warn("[Buffer] PeerConnection belum siap.");
            return;
        }
        
        const minSec = minMs / 1000;
        console.log(`[Buffer] Mencoba menerapkan delay ${minMs}ms ke semua track...`);

        try {
            const receivers = this.pc.getReceivers();
            if (receivers.length === 0) {
                console.warn("[Buffer] Tidak ada receiver ditemukan.");
                return;
            }

            receivers.forEach(receiver => {
                // 1. Standar Baru: jitterBufferTarget (Chromium 122+, satuan: milidetik)
                if ('jitterBufferTarget' in receiver) {
                    try {
                        receiver.jitterBufferTarget = minMs;
                    } catch(e) { console.error("Gagal set jitterBufferTarget", e); }
                }
                
                // 2. Legacy/Experimental: playoutDelayHint (Chromium 85+, satuan: detik)
                if ('playoutDelayHint' in receiver) {
                    receiver.playoutDelayHint = minSec;
                }
                
                // 3. Fallback langsung ke track (beberapa versi browser tertentu)
                if (receiver.track && 'playoutDelayHint' in receiver.track) {
                    receiver.track.playoutDelayHint = minSec;
                }

                console.log(`[Buffer] Applied to ${receiver.track?.kind || 'unknown'} track: ${minMs}ms`);
            });
        } catch (e) {
            console.error("[Buffer Error]", e);
        }
    }
};

window.Player = Player;