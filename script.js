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
    let localStream = null;
    let activeCall = null;
    
    // State management
    let myState = { tool: null, role: null };
    let remoteState = { tool: null, role: null };

    const roleOverlay = document.getElementById('role-overlay');
    const roleTitle = document.getElementById('role-title');
    const btnSender = document.getElementById('role-sender');
    const btnReceiver = document.getElementById('role-receiver');
    const btnCloseRole = document.getElementById('close-role');
    const conflictWarn = document.getElementById('conflict-warn');
    const conflictMsg = document.getElementById('conflict-msg');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const videoWrapper = document.getElementById('video-wrapper');

    peer = new Peer(undefined, { debug: 2 });

    peer.on('open', (id) => {
        myIdDisplay.innerText = id;
        peerIdInfo.innerText = "Siap menerima koneksi.";
        qrContainer.innerHTML = "";
        const baseUrl = window.location.href.split('?')[0];
        const connectUrl = baseUrl + "?join=" + id;
        new QRCode(qrContainer, { text: connectUrl, width: 200, height: 200 });
        const urlParams = new URLSearchParams(window.location.search);
        const joinId = urlParams.get('join');
        if (joinId) connectToPeer(joinId);
    });

    peer.on('connection', (conn) => setupConnection(conn));

    peer.on('call', (call) => {
        activeCall = call;
        call.answer();
        mirrorOverlay.classList.remove('hidden');
        call.on('stream', (stream) => {
            remoteVideo.srcObject = stream;
            mirrorPlaceholder.classList.add('hidden');
            remoteVideo.classList.add('active');
            document.getElementById('mirror-status-text').innerText = "Streaming Diterima";
        });
    });

    function connectToPeer(id) {
        setupConnection(peer.connect(id));
    }

    function setupConnection(conn) {
        currentConn = conn;
        conn.on('open', () => {
            statusInd.innerText = 'Terhubung';
            statusInd.classList.replace('offline', 'online');
            connScreen.classList.add('hidden');
            dashScreen.classList.remove('hidden');
            remoteIdDisplay.innerText = conn.peer;
        });

        conn.on('data', (data) => {
            if (data.type === 'file') handleReceivedFile(data);
            if (data.type === 'sync-state') {
                remoteState = { tool: data.tool, role: data.role };
                checkConflicts();
            }
        });

        conn.on('close', () => disconnectUI());
    }

    function syncState(tool, role) {
        myState = { tool, role };
        if (currentConn) {
            currentConn.send({ type: 'sync-state', tool, role });
        }
        checkConflicts();
    }

    function checkConflicts() {
        conflictWarn.classList.add('hidden');
        
        if (myState.tool && myState.tool === remoteState.tool) {
            if (myState.role === remoteState.role && myState.role !== null) {
                conflictWarn.classList.remove('hidden');
                conflictMsg.innerText = `Bentrok! Perangkat lawan juga memilih sebagai ${myState.role.toUpperCase()}.`;
                return false;
            }
            return true;
        }
        
        if (myState.tool && (!remoteState.tool || remoteState.tool !== myState.tool)) {
            conflictWarn.classList.remove('hidden');
            conflictMsg.innerText = "Menunggu perangkat lawan masuk ke alat yang sama...";
            return false;
        }
        return true;
    }

    // Tool Handlers
    btnShareFile.addEventListener('click', () => openRoleSelection('file'));
    btnMirroring.addEventListener('click', () => openRoleSelection('mirror'));

    function openRoleSelection(tool) {
        myState.tool = tool;
        roleTitle.innerText = tool === 'file' ? "Share File" : "Screen Mirroring";
        roleOverlay.classList.remove('hidden');
        syncState(tool, null);
    }

    btnSender.addEventListener('click', () => {
        syncState(myState.tool, 'sender');
        roleOverlay.classList.add('hidden');
        executeRole();
    });

    btnReceiver.addEventListener('click', () => {
        syncState(myState.tool, 'receiver');
        roleOverlay.classList.add('hidden');
        executeRole();
    });

    function executeRole() {
        if (!checkConflicts()) return;

        if (myState.tool === 'file') {
            if (myState.role === 'sender') fileInput.click();
            else showToast("Siap menerima file...");
        } else if (myState.tool === 'mirror') {
            mirrorOverlay.classList.remove('hidden');
            if (myState.role === 'sender') startCapture();
            else document.getElementById('mirror-wait-msg').innerText = "Menunggu pengirim memulai layar...";
        }
    }

    async function startCapture() {
        try {
            localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const call = peer.call(currentConn.peer, localStream);
            document.getElementById('mirror-status-text').innerText = "Sedang Berbagi Layar";
            mirrorPlaceholder.classList.add('hidden');
            
            localStream.getVideoTracks()[0].onended = () => stopCapture();
        } catch (err) {
            console.error(err);
            alert("Gagal mengakses rekaman layar.");
        }
    }

    function stopCapture() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        mirrorOverlay.classList.add('hidden');
        syncState(null, null);
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentConn && myState.role === 'sender') {
            currentConn.send({ type: 'file', fileName: file.name, fileType: file.type, blob: file });
            showToast(`Mengirim: ${file.name}`);
            simulateProgress(() => syncState(null, null));
        }
    });

    btnFullscreen.addEventListener('click', () => {
        if (videoWrapper.requestFullscreen) videoWrapper.requestFullscreen();
        else if (videoWrapper.webkitRequestFullscreen) videoWrapper.webkitRequestFullscreen();
    });

    btnCloseRole.addEventListener('click', () => {
        roleOverlay.classList.add('hidden');
        syncState(null, null);
    });

    closeMirror.addEventListener('click', () => {
        stopCapture();
        if (activeCall) activeCall.close();
        mirrorOverlay.classList.add('hidden');
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