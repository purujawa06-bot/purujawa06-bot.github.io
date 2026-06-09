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

    toggleFullScreen(elementId) {
        const elem = document.getElementById(elementId);
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    },

    /**
     * Mengatur playoutDelayHint & jitterBufferTarget pada RTCRtpReceiver.
     * Memisahkan target delay audio dan video untuk sinkronisasi yang lebih baik.
     */
    setPlayoutDelay(minMs) {
        if (!this.pc) return;
        const receivers = this.pc.getReceivers();
        if (receivers.length === 0) return;

        receivers.forEach(receiver => {
            if (!receiver.track) return;
            const kind = receiver.track.kind;

            // Audio: buffer ditingkatkan sedikit agar lebih stabil di jaringan fluktuatif
            const targetMs  = kind === 'audio' ? Math.min(minMs, 300) : minMs;
            const targetSec = targetMs / 1000;

            try {
                // 1. jitterBufferTarget (Chromium 122+)
                if ('jitterBufferTarget' in receiver) {
                    receiver.jitterBufferTarget = targetMs;
                }
                // 2. playoutDelayHint (Chromium 85+)
                if ('playoutDelayHint' in receiver) {
                    receiver.playoutDelayHint = targetSec;
                }
                console.log(`[Buffer] ${kind}: ${targetMs}ms`);
            } catch(e) {
                console.error(`[Buffer] Gagal set ${kind}:`, e);
            }
        });
    }
};

window.Player = Player;