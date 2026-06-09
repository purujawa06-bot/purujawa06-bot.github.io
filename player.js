/**
 * Player.js - Menangani penskalaan video untuk WebRTC Mirroring menggunakan Native Video Element
 */

const Player = {
    scaleMode: 'contain', // contain, cover, atau fill
    currentZoom: 1,
    video: null,

    init(videoElement) {
        this.video = videoElement;
        this.applyStyle();
    },

    toggleScaleMode() {
        if (this.scaleMode === 'contain') {
            this.scaleMode = 'cover'; 
        } else if (this.scaleMode === 'cover') {
            this.scaleMode = 'fill';  
        } else {
            this.scaleMode = 'contain';
        }
        this.applyStyle();
        return this.scaleMode;
    },

    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom + 0.1, 3.0);
        this.applyStyle();
        return this.currentZoom;
    },

    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom - 0.1, 0.5);
        this.applyStyle();
        return this.currentZoom;
    },

    applyStyle() {
        if (!this.video) return;

        // Terapkan transformasi zoom
        this.video.style.transform = `scale(${this.currentZoom})`;
        this.video.style.transformOrigin = 'center center';
        this.video.style.transition = 'all 0.2s ease-out';
        
        // Atur object-fit
        if (this.scaleMode === 'contain') {
            this.video.style.objectFit = 'contain';
        } else if (this.scaleMode === 'cover') {
            this.video.style.objectFit = 'cover';
        } else if (this.scaleMode === 'fill') {
            this.video.style.objectFit = 'fill';
        }
    },

    /**
     * Mengatur playoutDelayHint (Chromium based) untuk mengontrol buffer latency
     * @param {number} min - Minimum delay dalam milidetik
     * @param {number} max - Maximum delay dalam milidetik
     */
    setPlayoutDelay(min, max) {
        if (!this.video || !this.video.srcObject) return;
        
        const stream = this.video.srcObject;
        const minSec = min / 1000;
        const maxSec = max / 1000;

        stream.getTracks().forEach(track => {
            if ('playoutDelayHint' in track) {
                track.playoutDelayHint = minSec;
                console.log(`Setting buffer for ${track.kind}: ${min}ms`);
            } else {
                console.warn("playoutDelayHint tidak didukung di browser ini.");
            }
        });

        // Pada beberapa versi browser, kita juga bisa mencoba mengatur receiver constraints
        // Namun playoutDelayHint adalah standar terbaru untuk WebRTC buffer control.
    }
};

window.Player = Player;