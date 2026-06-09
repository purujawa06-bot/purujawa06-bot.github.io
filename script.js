document.addEventListener('DOMContentLoaded', () => {
    const qrContainer = document.getElementById('qrcode');
    const connScreen = document.getElementById('connection-screen');
    const dashScreen = document.getElementById('dashboard-screen');
    const statusInd = document.getElementById('status-indicator');
    const myIdDisplay = document.getElementById('my-id');
    const remoteIdDisplay = document.getElementById('remote-id');
    const peerIdInfo = document.getElementById('peer-id-display');
    
    // Video Elements
    const remoteVideo = document.getElementById('remote-video');
    const mirrorPlaceholder = document.getElementById('mirror-placeholder');
    const mirrorOverlay = document.getElementById('mirror-overlay');
    const closeMirror = document.getElementById('close-mirror');

    // UI Elements
    const btnShareFile = document.getElementById('btn-share-file');
    const btnMirroring = document.getElementById('btn-mirroring');
    const fileInput = document.getElementById('file-input');
    const transferToast = document.getElementById('transfer-toast');
    const progressFill = document.querySelector('.progress-fill');
    const transferMsg = document.getElementById('transfer-msg');
    const btnDisconnect = document.getElementById('sim-disconnect');

    let peer = null;
    let currentConn = null;

    // Inisialisasi PeerJS dengan konfigurasi eksplisit untuk keandalan
    peer = new Peer(undefined, {
        debug: 2
    });

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        myIdDisplay.innerText = id;
        peerIdInfo.innerText = "Siap menerima koneksi.";
        
        // Membersihkan QR container sebelum generate baru
        qrContainer.innerHTML = "";
        
        // Perbaikan pembentukan URL agar tidak duplikasi query string
        const baseUrl = window.location.href.split('?')[0];
        const connectUrl = baseUrl + "?join=" + id;
        
        new QRCode(qrContainer, {
            text: connectUrl,
            width: 200,
            height: 200,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Cek jika kita adalah pihak yang mencoba join (dari URL)
        const urlParams = new URLSearchParams(window.location.search);
        const joinId = urlParams.get('join');
        if (joinId) {
            peerIdInfo.innerText = "Menghubungkan ke: " + joinId;
            connectToPeer(joinId);
        }
    });

    peer.on('error', (err) => {
        console.error('PeerJS Error:', err);
        peerIdInfo.innerText = "Kesalahan: " + err.type;
        peerIdInfo.style.color = "#ef4444";
    });

    // Menangani koneksi masuk
    peer.on('connection', (conn) => {
        setupConnection(conn);
    });

    // Menangani panggilan video masuk (Mirroring)
    peer.on('call', (call) => {
        call.answer(); 
        mirrorOverlay.classList.remove('hidden');
        call.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
            mirrorPlaceholder.classList.add('hidden');
            remoteVideo.classList.add('active');
        });
    });

    function connectToPeer(id) {
        const conn = peer.connect(id);
        setupConnection(conn);
    }

    function setupConnection(conn) {
        currentConn = conn;
        
        conn.on('open', () => {
            statusInd.innerText = 'Terhubung';
            statusInd.classList.remove('offline');
            statusInd.classList.add('online');
            connScreen.classList.add('hidden');
            dashScreen.classList.remove('hidden');
            remoteIdDisplay.innerText = conn.peer;
        });

        conn.on('data', (data) => {
            if (data.type === 'file') {
                handleReceivedFile(data);
            }
        });

        conn.on('close', () => {
            disconnectUI();
        });
    }

    // Fitur Share File
    btnShareFile.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentConn) {
            currentConn.send({
                type: 'file',
                fileName: file.name,
                fileType: file.type,
                blob: file
            });
            showToast(`Mengirim: ${file.name}`);
            simulateProgress();
        } else if (!currentConn) {
            alert("Perangkat belum terhubung!");
        }
    });

    // Fitur Mirroring (Informasi)
    btnMirroring.addEventListener('click', () => {
        if (!currentConn) {
            alert("Hubungkan perangkat terlebih dahulu untuk memulai mirroring.");
            return;
        }
        mirrorOverlay.classList.remove('hidden');
        // Memberitahu pengirim (HP) untuk mulai streaming jika protokol diimplementasikan
        currentConn.send({ type: 'command', action: 'start-mirror' });
    });

    function handleReceivedFile(data) {
        showToast(`Menerima: ${data.fileName}`);
        simulateProgress(() => {
            const url = URL.createObjectURL(data.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.fileName;
            a.click();
            transferMsg.innerText = 'File diterima & disimpan!';
        });
    }

    function showToast(msg) {
        transferToast.classList.remove('hidden');
        transferMsg.innerText = msg;
        progressFill.style.width = '0%';
    }

    function simulateProgress(callback) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressFill.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
                if (callback) callback();
                setTimeout(() => {
                    transferToast.classList.add('hidden');
                }, 2500);
            }
        }, 50);
    }

    function disconnectUI() {
        dashScreen.classList.add('hidden');
        connScreen.classList.remove('hidden');
        statusInd.innerText = 'Terputus';
        statusInd.classList.remove('online');
        statusInd.classList.add('offline');
        remoteIdDisplay.innerText = "None";
        // Reset URL tanpa parameter join
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    btnDisconnect.addEventListener('click', () => {
        if (currentConn) currentConn.close();
        disconnectUI();
    });

    closeMirror.addEventListener('click', () => {
        mirrorOverlay.classList.add('hidden');
        if (remoteVideo.srcObject) {
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            remoteVideo.srcObject = null;
        }
        remoteVideo.classList.remove('active');
        mirrorPlaceholder.classList.remove('hidden');
    });
});