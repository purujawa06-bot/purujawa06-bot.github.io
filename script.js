document.addEventListener('DOMContentLoaded', () => {

    // ========== ELEMENT REFS ==========
    const qrContainer = document.getElementById('qrcode');
    const connScreen = document.getElementById('connection-screen');
    const dashScreen = document.getElementById('dashboard-screen');
    const statusInd = document.getElementById('status-indicator');
    const myIdDisplay = document.getElementById('my-id');
    const remoteIdDisplay = document.getElementById('remote-id');
    const peerIdInfo = document.getElementById('peer-id-display');

    // Role overlay
    const roleOverlay = document.getElementById('role-overlay');
    const roleTitle = document.getElementById('role-title');
    const senderHint = document.getElementById('sender-hint');
    const receiverHint = document.getElementById('receiver-hint');
    const btnSender = document.getElementById('role-sender');
    const btnReceiver = document.getElementById('role-receiver');
    const btnCloseRole = document.getElementById('close-role');

    // Share File overlay
    const sharefileOverlay = document.getElementById('sharefile-overlay');
    const sfTitle = document.getElementById('sf-title');
    const sfRoleBadge = document.getElementById('sf-role-badge');
    const sfSenderUI = document.getElementById('sf-sender-ui');
    const sfReceiverUI = document.getElementById('sf-receiver-ui');
    const fileInput = document.getElementById('file-input');
    const fileQueue = document.getElementById('file-queue');
    const fileList = document.getElementById('file-list');
    const btnSendFiles = document.getElementById('btn-send-files');
    const sfDropZone = document.getElementById('sf-drop-zone');
    const receivedFilesList = document.getElementById('received-files-list');
    const closeSharefile = document.getElementById('close-sharefile');

    // Mirror overlay
    const mirrorOverlay = document.getElementById('mirror-overlay');
    const mirrorModalContent = document.getElementById('mirror-modal-content');
    const mirrorStatusText = document.getElementById('mirror-status-text');
    const mirrorRoleBadge = document.getElementById('mirror-role-badge');
    const remoteVideo = document.getElementById('remote-video');
    const localPreview = document.getElementById('local-preview');
    const mirrorPlaceholder = document.getElementById('mirror-placeholder');
    const mirrorWaitMsg = document.getElementById('mirror-wait-msg');
    const senderControls = document.getElementById('sender-controls');
    const btnStopCapture = document.getElementById('btn-stop-capture');
    const shareStatusLabel = document.getElementById('share-status-label');
    const btnPcOptions = document.getElementById('btn-pc-options');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const videoWrapper = document.getElementById('video-wrapper');
    const closeMirror = document.getElementById('close-mirror');
    const pcOptionsPanel = document.getElementById('pc-options-panel');

    // PC Options
    const btnStartRecord = document.getElementById('btn-start-record');
    const btnStopRecord = document.getElementById('btn-stop-record');
    const recTimer = document.getElementById('rec-timer');
    const selectAudioInput = document.getElementById('select-audio-input');
    const selectVideoInput = document.getElementById('select-video-input');
    const selectAudioOutput = document.getElementById('select-audio-output');
    const btnApplyOutput = document.getElementById('btn-apply-output');

    // Conflict
    const conflictWarn = document.getElementById('conflict-warn');
    const conflictMsg = document.getElementById('conflict-msg');

    // Toast
    const transferToast = document.getElementById('transfer-toast');
    const progressFill = document.getElementById('progress-fill');
    const transferMsg = document.getElementById('transfer-msg');
    const toastIcon = document.getElementById('toast-icon');

    // ========== STATE ==========
    let peer = null;
    let currentConn = null;
    let localStream = null;
    let activeCall = null;
    let pendingFiles = [];
    let mediaRecorder = null;
    let recordedChunks = [];
    let recInterval = null;
    let recSeconds = 0;
    let myState = { tool: null, role: null };
    let remoteState = { tool: null, role: null };

    // ========== PEER INIT ==========
    peer = new Peer(undefined, { debug: 2 });

    peer.on('open', (id) => {
        myIdDisplay.innerText = id;
        peerIdInfo.innerText = 'Siap menerima koneksi.';
        qrContainer.innerHTML = '';
        const baseUrl = window.location.href.split('?')[0];
        const connectUrl = baseUrl + '?join=' + id;
        new QRCode(qrContainer, { text: connectUrl, width: 200, height: 200 });
        const urlParams = new URLSearchParams(window.location.search);
        const joinId = urlParams.get('join');
        if (joinId && joinId !== id) connectToPeer(joinId);
    });

    peer.on('connection', (conn) => setupConnection(conn));

    peer.on('call', (call) => {
        activeCall = call;
        // Auto answer if receiver is ready
        call.answer();
        mirrorOverlay.classList.remove('hidden');
        mirrorRoleBadge.innerText = '📥 Penerima';
        mirrorRoleBadge.className = 'role-indicator receiver';
        btnPcOptions.classList.remove('hidden');
        populateDevices();

        call.on('stream', (stream) => {
            remoteVideo.srcObject = stream;
            mirrorPlaceholder.classList.add('hidden');
            remoteVideo.classList.add('active');
            mirrorStatusText.innerText = '📺 Stream Diterima';
            // Apply output device if set
            applyAudioOutput();
        });
        call.on('close', () => resetMirrorUI());
    });

    // ========== CONNECTION ==========
    function connectToPeer(id) { setupConnection(peer.connect(id)); }

    function setupConnection(conn) {
        currentConn = conn;
        conn.on('open', () => {
            statusInd.innerText = '🔗 Terhubung';
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
                // If remote starts mirroring as sender, open mirror overlay as receiver
                if (data.tool === 'mirror' && data.role === 'sender') {
                    if (myState.role !== 'sender') {
                        openMirrorAsReceiver();
                    }
                }
            }
        });

        conn.on('close', () => disconnectUI());
    }

    // ========== STATE SYNC ==========
    function syncState(tool, role) {
        myState = { tool, role };
        if (currentConn) currentConn.send({ type: 'sync-state', tool, role });
        checkConflicts();
    }

    function checkConflicts() {
        conflictWarn.classList.add('hidden');
        if (!myState.tool) return true;

        if (myState.tool === remoteState.tool) {
            if (myState.role === remoteState.role && myState.role !== null) {
                conflictWarn.classList.remove('hidden');
                conflictMsg.innerText = `⚠️ Bentrok! Kedua perangkat memilih sebagai ${myState.role === 'sender' ? 'PENGIRIM' : 'PENERIMA'}.`;
                return false;
            }
            return true;
        }

        if (!remoteState.tool || remoteState.tool !== myState.tool) {
            conflictWarn.classList.remove('hidden');
            conflictMsg.innerText = '📡 Menunggu perangkat lawan masuk ke fitur yang sama...';
            return false;
        }
        return true;
    }

    // ========== ROLE SELECTION ==========
    window.openRoleSelection = function(tool) {
        myState.tool = tool;
        if (tool === 'file') {
            roleTitle.innerText = '📁 Share File';
            senderHint.innerText = 'Kirim file ke perangkat lain';
            receiverHint.innerText = 'Terima file dari perangkat lain';
        } else {
            roleTitle.innerText = '📺 Screen Mirroring';
            senderHint.innerText = 'Bagikan layar Anda';
            receiverHint.innerText = 'Lihat layar perangkat lain';
        }
        roleOverlay.classList.remove('hidden');
        syncState(tool, null);
    };

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

    btnCloseRole.addEventListener('click', () => {
        roleOverlay.classList.add('hidden');
        syncState(null, null);
    });

    function executeRole() {
        if (myState.tool === 'file') {
            openShareFile(myState.role);
        } else if (myState.tool === 'mirror') {
            if (myState.role === 'sender') {
                openMirrorAsSender();
            } else {
                openMirrorAsReceiver();
            }
        }
    }

    // ========== SHARE FILE ==========
    function openShareFile(role) {
        sharefileOverlay.classList.remove('hidden');
        sfTitle.innerText = role === 'sender' ? '📤 Kirim File' : '📥 Terima File';
        sfRoleBadge.innerText = role === 'sender' ? '📤 Pengirim' : '📥 Penerima';
        sfRoleBadge.className = 'role-indicator ' + role;

        if (role === 'sender') {
            sfSenderUI.classList.remove('hidden');
            sfReceiverUI.classList.add('hidden');
            pendingFiles = [];
            renderFileQueue();
        } else {
            sfSenderUI.classList.add('hidden');
            sfReceiverUI.classList.remove('hidden');
        }
    }

    closeSharefile.addEventListener('click', () => {
        sharefileOverlay.classList.add('hidden');
        pendingFiles = [];
        syncState(null, null);
    });

    // Drag & drop
    sfDropZone.addEventListener('dragover', (e) => { e.preventDefault(); sfDropZone.style.transform = 'scale(1.05)'; });
    sfDropZone.addEventListener('dragleave', () => { sfDropZone.style.transform = ''; });
    sfDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        sfDropZone.style.transform = '';
        addFilesToQueue([...e.dataTransfer.files]);
    });

    fileInput.addEventListener('change', (e) => {
        addFilesToQueue([...e.target.files]);
        fileInput.value = '';
    });

    function addFilesToQueue(files) {
        pendingFiles = [...pendingFiles, ...files];
        renderFileQueue();
    }

    function renderFileQueue() {
        if (pendingFiles.length === 0) {
            fileQueue.classList.add('hidden');
            return;
        }
        fileQueue.classList.remove('hidden');
        fileList.innerHTML = '';
        pendingFiles.forEach((file, idx) => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <div class="file-item-icon">${getFileIcon(file.type)}</div>
                <div class="file-item-info">
                    <div class="file-item-name">${file.name}</div>
                    <div class="file-item-size">${formatBytes(file.size)}</div>
                </div>
                <button class="file-item-remove" data-idx="${idx}" title="Hapus">✕</button>
            `;
            fileList.appendChild(item);
        });
        fileList.querySelectorAll('.file-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                pendingFiles.splice(idx, 1);
                renderFileQueue();
            });
        });
    }

    btnSendFiles.addEventListener('click', () => {
        if (!pendingFiles.length || !currentConn) return;
        let sent = 0;
        showToast(`📤 Mengirim ${pendingFiles.length} file...`, '📤');
        pendingFiles.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentConn.send({ type: 'file', fileName: file.name, fileType: file.type, fileSize: file.size, blob: new Blob([e.target.result], { type: file.type }) });
                sent++;
                if (sent === pendingFiles.length) {
                    simulateProgress(() => {
                        pendingFiles = [];
                        renderFileQueue();
                        syncState(null, null);
                    });
                }
            };
            reader.readAsArrayBuffer(file);
        });
    });

    function handleReceivedFile(data) {
        // Make sure receiver UI is open
        if (sharefileOverlay.classList.contains('hidden') || myState.role !== 'receiver') {
            openShareFile('receiver');
        }
        const url = URL.createObjectURL(data.blob);
        showToast(`📥 Menerima: ${data.fileName}`, '📥');

        const item = document.createElement('div');
        item.className = 'received-item';
        item.innerHTML = `
            <span style="font-size:1.4rem;">${getFileIcon(data.fileType)}</span>
            <div style="flex:1;overflow:hidden;">
                <a href="${url}" download="${data.fileName}">${data.fileName}</a>
                <div class="received-item-size">${formatBytes(data.fileSize || 0)} — Ketuk untuk unduh</div>
            </div>
        `;
        receivedFilesList.appendChild(item);

        simulateProgress(() => {
            transferMsg.innerText = '✅ File diterima!';
        });
    }

    // ========== SCREEN MIRRORING ==========
    function openMirrorAsSender() {
        mirrorOverlay.classList.remove('hidden');
        mirrorRoleBadge.innerText = '📤 Pengirim';
        mirrorRoleBadge.className = 'role-indicator sender';
        senderControls.classList.remove('hidden');
        btnPcOptions.classList.add('hidden');
        pcOptionsPanel.classList.add('hidden');
        mirrorPlaceholder.classList.remove('hidden');
        mirrorWaitMsg.innerText = 'Siap berbagi layar. Klik tombol di bawah.';
        mirrorStatusText.innerText = '📤 Mode Pengirim';
        startCapture();
    }

    function openMirrorAsReceiver() {
        mirrorOverlay.classList.remove('hidden');
        mirrorRoleBadge.innerText = '📥 Penerima';
        mirrorRoleBadge.className = 'role-indicator receiver';
        senderControls.classList.add('hidden');
        btnPcOptions.classList.remove('hidden');
        mirrorPlaceholder.classList.remove('hidden');
        mirrorWaitMsg.innerText = '⏳ Menunggu pengirim memulai...';
        mirrorStatusText.innerText = '📥 Mode Penerima';
        populateDevices();
    }

    async function startCapture() {
        try {
            localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const call = peer.call(currentConn.peer, localStream);
            activeCall = call;

            // Show local preview
            localPreview.srcObject = localStream;
            localPreview.classList.add('active');
            mirrorPlaceholder.classList.add('hidden');
            mirrorStatusText.innerText = '🔴 Sedang Berbagi Layar';
            shareStatusLabel.innerText = '🔴 Aktif berbagi';
            shareStatusLabel.classList.add('active');

            localStream.getVideoTracks()[0].onended = () => stopCapture();
        } catch (err) {
            console.warn('Gagal capture:', err);
            if (err.name !== 'NotAllowedError') {
                alert('Gagal mengakses layar. Pastikan izin diberikan.');
            }
            mirrorOverlay.classList.add('hidden');
        }
    }

    function stopCapture() {
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            localStream = null;
        }
        if (activeCall) { activeCall.close(); activeCall = null; }
        resetMirrorUI();
        syncState(null, null);
    }

    btnStopCapture.addEventListener('click', stopCapture);

    function resetMirrorUI() {
        remoteVideo.srcObject = null;
        remoteVideo.classList.remove('active');
        localPreview.srcObject = null;
        localPreview.classList.remove('active');
        mirrorPlaceholder.classList.remove('hidden');
        mirrorWaitMsg.innerText = 'Menunggu stream...';
        mirrorStatusText.innerText = 'Screen Mirroring';
        shareStatusLabel.innerText = 'Belum berbagi';
        shareStatusLabel.classList.remove('active');
        stopRecording();
        senderControls.classList.add('hidden');
    }

    closeMirror.addEventListener('click', () => {
        stopCapture();
        stopRecording();
        mirrorOverlay.classList.add('hidden');
        pcOptionsPanel.classList.add('hidden');
        syncState(null, null);
    });

    // Fullscreen
    btnFullscreen.addEventListener('click', () => {
        const el = mirrorModalContent;
        if (!document.fullscreenElement) {
            (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullscreen).call(el);
            btnFullscreen.innerText = '⊡';
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            btnFullscreen.innerText = '⛶';
        }
    });

    // PC Options toggle
    btnPcOptions.addEventListener('click', () => {
        pcOptionsPanel.classList.toggle('hidden');
        btnPcOptions.classList.toggle('active');
    });

    // ========== PC OPTIONS: DEVICES ==========
    async function populateDevices() {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) { /* ignore */ }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            selectAudioInput.innerHTML = '<option value="">-- Mikrofon --</option>';
            selectVideoInput.innerHTML = '<option value="">-- Kamera --</option>';
            selectAudioOutput.innerHTML = '<option value="">-- Speaker Default --</option>';

            devices.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.deviceId;
                opt.innerText = d.label || (d.kind + ' ' + selectAudioInput.options.length);
                if (d.kind === 'audioinput') selectAudioInput.appendChild(opt.cloneNode(true));
                else if (d.kind === 'videoinput') selectVideoInput.appendChild(opt.cloneNode(true));
                else if (d.kind === 'audiooutput') selectAudioOutput.appendChild(opt.cloneNode(true));
            });
        } catch (e) {
            console.warn('Cannot enumerate devices:', e);
        }
    }

    // Apply audio output to video element
    function applyAudioOutput() {
        const deviceId = selectAudioOutput.value;
        if (deviceId && remoteVideo.setSinkId) {
            remoteVideo.setSinkId(deviceId).catch(e => console.warn('setSinkId error:', e));
        }
    }

    btnApplyOutput.addEventListener('click', applyAudioOutput);
    selectAudioOutput.addEventListener('change', applyAudioOutput);

    // ========== PC OPTIONS: RECORDER ==========
    btnStartRecord.addEventListener('click', startRecording);
    btnStopRecord.addEventListener('click', stopRecording);

    function startRecording() {
        const stream = remoteVideo.srcObject || localStream;
        if (!stream) { showToast('⚠️ Belum ada stream untuk direkam', '⚠️'); return; }

        recordedChunks = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
        mediaRecorder = new MediaRecorder(stream, { mimeType });

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => saveRecording();
        mediaRecorder.start(500);

        btnStartRecord.classList.add('hidden');
        btnStopRecord.classList.remove('hidden');
        recTimer.classList.remove('hidden');
        recSeconds = 0;
        recTimer.innerText = '00:00';
        recInterval = setInterval(() => {
            recSeconds++;
            const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
            const s = String(recSeconds % 60).padStart(2, '0');
            recTimer.innerText = `${m}:${s}`;
        }, 1000);

        showToast('🔴 Perekaman dimulai', '🔴');
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        clearInterval(recInterval);
        btnStartRecord.classList.remove('hidden');
        btnStopRecord.classList.add('hidden');
        recTimer.classList.add('hidden');
        mediaRecorder = null;
    }

    function saveRecording() {
        if (!recordedChunks.length) return;
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mirroring-rec-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ Rekaman disimpan!', '✅');
        recordedChunks = [];
    }

    // ========== DISCONNECT ==========
    document.getElementById('sim-disconnect').addEventListener('click', () => {
        if (currentConn) currentConn.close();
        disconnectUI();
    });

    function disconnectUI() {
        dashScreen.classList.add('hidden');
        connScreen.classList.remove('hidden');
        statusInd.innerText = 'Terputus';
        statusInd.classList.remove('online');
        statusInd.classList.add('offline');
        remoteIdDisplay.innerText = 'None';
        stopCapture();
        stopRecording();
        sharefileOverlay.classList.add('hidden');
        mirrorOverlay.classList.add('hidden');
        roleOverlay.classList.add('hidden');
        myState = { tool: null, role: null };
        remoteState = { tool: null, role: null };
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // ========== TOAST ==========
    function showToast(msg, icon = '🚀') {
        toastIcon.innerText = icon;
        transferMsg.innerText = msg;
        progressFill.style.width = '0%';
        transferToast.classList.remove('hidden');
    }

    function simulateProgress(callback) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 4;
            progressFill.style.width = Math.min(progress, 100) + '%';
            if (progress >= 100) {
                clearInterval(interval);
                if (callback) callback();
                setTimeout(() => transferToast.classList.add('hidden'), 2500);
            }
        }, 50);
    }

    // ========== UTILS ==========
    function getFileIcon(mimeType = '') {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
        if (mimeType.startsWith('text/')) return '📃';
        return '📁';
    }

    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Auto-open mirror receiver if remote is already sharing
    function checkRemoteMirrorState() {
        if (remoteState.tool === 'mirror' && remoteState.role === 'sender' && myState.tool !== 'mirror') {
            // Prompt user
        }
    }
});
