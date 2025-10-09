// App State
let appState = {
    currentUser: null,
    partner: null,
    connectionCode: null,
    coupleId: null,
    isConnected: false,
    role: null, // 'creator' or 'joiner'
    notifications: true,
    autoSync: true,
    lastSeen: Date.now()
};

// Firebase references
let coupleRef = null;
let wallpapersRef = null;
let presenceRef = null;
let partnerPresenceRef = null;

// DOM Elements
const screens = {
    welcome: document.getElementById('welcomeScreen'),
    create: document.getElementById('createScreen'),
    join: document.getElementById('joinScreen'),
    success: document.getElementById('successScreen'),
    app: document.getElementById('appScreen'),
    chat: document.getElementById('chatScreen'),
    history: document.getElementById('historyScreen'),
    vault: document.getElementById('vaultScreen'),
    settings: document.getElementById('settingsScreen')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadAppState();
    showNotification("Welcome to LoveSync! 💕", "info");
});

// Event Listeners
function initializeEventListeners() {
    // Welcome screen actions
    document.getElementById('createCoupleCard').addEventListener('click', () => {
        showScreen('create');
    });
    
    document.getElementById('joinCoupleCard').addEventListener('click', () => {
        showScreen('join');
    });
    
    // Navigation
    document.getElementById('mainBtn').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('app');
            updateNavActiveState('mainBtn');
        } else {
            showScreen('welcome');
            updateNavActiveState('mainBtn');
        }
    });
    
    document.getElementById('historyBtn').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('history');
            loadHistory();
            updateNavActiveState('historyBtn');
        } else {
            showNotification("Please connect with your partner first! 💑", "warning");
        }
    });
    
    document.getElementById('vaultBtn').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('vault');
            loadVault();
            updateNavActiveState('vaultBtn');
        } else {
            showNotification("Please connect with your partner first! 💑", "warning");
        }
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('settings');
            updateNavActiveState('settingsBtn');
        } else {
            showNotification("Please connect with your partner first! 💑", "warning");
        }
    });
    
    // Back buttons
    document.getElementById('backFromCreate').addEventListener('click', () => {
        showScreen('welcome');
        updateNavActiveState('mainBtn');
    });
    
    document.getElementById('backFromJoin').addEventListener('click', () => {
        showScreen('welcome');
        updateNavActiveState('mainBtn');
    });
    
    document.getElementById('backFromHistory').addEventListener('click', () => {
        showScreen('app');
        updateNavActiveState('mainBtn');
    });
    
    document.getElementById('backFromVault').addEventListener('click', () => {
        showScreen('app');
        updateNavActiveState('mainBtn');
    });
    
    document.getElementById('backFromSettings').addEventListener('click', () => {
        showScreen('app');
        updateNavActiveState('mainBtn');
    });
    
    // Forms
    document.getElementById('createForm').addEventListener('submit', handleCreateCouple);
    document.getElementById('joinForm').addEventListener('submit', handleJoinCouple);
    
    // Success screen
    document.getElementById('continueBtn').addEventListener('click', () => {
        showScreen('app');
        initializeApp();
        updateNavActiveState('mainBtn');
    });
    
    document.getElementById('copyCodeBtn').addEventListener('click', copyConnectionCode);
    
    // App functionality
    document.getElementById('uploadArea').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    
    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Quick actions
    document.getElementById('cameraBtn').addEventListener('click', handleCamera);
    document.getElementById('galleryBtn').addEventListener('click', handleGallery);
    document.getElementById('surpriseBtn').addEventListener('click', handleSurprise);
    
    // Settings
    document.getElementById('notificationsToggle').addEventListener('change', (e) => {
        appState.notifications = e.target.checked;
        saveAppState();
        showNotification(
            e.target.checked ? "Notifications enabled! 💕" : "Notifications disabled 🔕",
            "info"
        );
    });
    
    document.getElementById('autoSyncToggle').addEventListener('change', (e) => {
        appState.autoSync = e.target.checked;
        saveAppState();
        showNotification(
            e.target.checked ? "Auto-sync enabled! ✨" : "Auto-sync disabled 🔒",
            "info"
        );
    });
    
    document.getElementById('disconnectBtn').addEventListener('click', handleDisconnect);
    
    // Logo click to go home
    document.querySelector('.logo').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('app');
            updateNavActiveState('mainBtn');
        } else {
            showScreen('welcome');
            updateNavActiveState('mainBtn');
        }
    });
}

// Screen Management
function showScreen(screenName) {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            currentScreen.classList.remove('active');
            currentScreen.style.animation = '';
        }, 300);
    }
    
    setTimeout(() => {
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }
    }, 300);
}

// Navigation Active State
function updateNavActiveState(activeBtn) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (activeBtn) {
        document.getElementById(activeBtn).classList.add('active');
    }
}

// Create Couple with Firebase
async function handleCreateCouple(e) {
    e.preventDefault();
    
    const createBtn = e.target.querySelector('.primary-btn');
    const userName = document.getElementById('createName').value.trim();
    const partnerName = document.getElementById('partnerName').value.trim();
    
    if (!userName || !partnerName) {
        showNotification("Please fill in both names! 💫", "warning");
        return;
    }
    
    createBtn.classList.add('loading');
    
    try {
        const connectionCode = generateConnectionCode();
        const coupleId = `couple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create couple in Firebase
        const coupleData = {
            connectionCode: connectionCode,
            coupleId: coupleId,
            creator: {
                name: userName,
                joinedAt: firebase.database.ServerValue.TIMESTAMP,
                lastSeen: firebase.database.ServerValue.TIMESTAMP,
                isOnline: true
            },
            partner: {
                name: partnerName,
                joined: false
            },
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'waiting_for_partner'
        };
        
        await window.firebaseDB.ref(`couples/${connectionCode}`).set(coupleData);
        
        // Save to app state
        appState.currentUser = userName;
        appState.partner = partnerName;
        appState.connectionCode = connectionCode;
        appState.coupleId = coupleId;
        appState.isConnected = false;
        appState.role = 'creator';
        
        saveAppState();
        
        // Setup Firebase listeners for this connection
        setupConnectionListener(connectionCode);
        
        // Show success screen
        document.getElementById('connectionMessage').textContent = 
            `Share the code below with ${partnerName} to connect your hearts!`;
        document.getElementById('displayCode').textContent = connectionCode;
        document.getElementById('codeDisplay').style.display = 'block';
        
        createBtn.classList.remove('loading');
        showScreen('success');
        
        showNotification("Connection code created! Share it with your love 💕", "success");
        
    } catch (error) {
        console.error('Error creating couple:', error);
        showNotification("Failed to create connection. Please try again! 😢", "error");
        createBtn.classList.remove('loading');
    }
}

// Join Couple with Firebase
async function handleJoinCouple(e) {
    e.preventDefault();
    
    const joinBtn = e.target.querySelector('.primary-btn');
    const userName = document.getElementById('joinName').value.trim();
    const connectionCode = document.getElementById('connectionCode').value.trim().toUpperCase();
    
    if (!userName || !connectionCode) {
        showNotification("Please fill in all fields! 💑", "warning");
        return;
    }
    
    if (connectionCode.length !== 6) {
        showNotification("Connection code must be 6 characters! 🔢", "warning");
        return;
    }
    
    joinBtn.classList.add('loading');
    
    try {
        // Check if connection code exists in Firebase
        const coupleSnapshot = await window.firebaseDB.ref(`couples/${connectionCode}`).once('value');
        
        if (!coupleSnapshot.exists()) {
            showNotification("Invalid connection code! Please check and try again 💔", "error");
            joinBtn.classList.remove('loading');
            return;
        }
        
        const coupleData = coupleSnapshot.val();
        
        // Check if partner already joined
        if (coupleData.partner.joined) {
            showNotification("This connection is already complete! 💔", "error");
            joinBtn.classList.remove('loading');
            return;
        }
        
        // Update partner info in Firebase
        await window.firebaseDB.ref(`couples/${connectionCode}/partner`).update({
            name: userName,
            joined: true,
            joinedAt: firebase.database.ServerValue.TIMESTAMP,
            lastSeen: firebase.database.ServerValue.TIMESTAMP,
            isOnline: true
        });
        
        await window.firebaseDB.ref(`couples/${connectionCode}`).update({
            status: 'connected'
        });
        
        // Save to app state
        appState.currentUser = userName;
        appState.partner = coupleData.creator.name;
        appState.connectionCode = connectionCode;
        appState.coupleId = coupleData.coupleId;
        appState.isConnected = true;
        appState.role = 'joiner';
        
        saveAppState();
        
        // Setup Firebase listeners
        setupCoupleListeners(connectionCode);
        
        document.getElementById('connectionMessage').textContent = 
            `Hearts connected! You and ${appState.partner} are now synced 💕`;
        document.getElementById('codeDisplay').style.display = 'none';
        
        joinBtn.classList.remove('loading');
        showScreen('success');
        showNotification("Successfully connected! Your hearts are now in sync 💕", "success");
        
    } catch (error) {
        console.error('Error joining couple:', error);
        showNotification("Failed to join connection. Please try again! 😢", "error");
        joinBtn.classList.remove('loading');
    }
}

// Setup connection listener for creator (waiting for partner to join)
function setupConnectionListener(connectionCode) {
    const partnerRef = window.firebaseDB.ref(`couples/${connectionCode}/partner`);
    
    partnerRef.on('value', (snapshot) => {
        const partnerData = snapshot.val();
        if (partnerData && partnerData.joined) {
            appState.isConnected = true;
            saveAppState();
            showNotification(`${partnerData.name} just connected! Your hearts are in sync 💕`, "success");
            
            // Setup full couple listeners
            setupCoupleListeners(connectionCode);
        }
    });
}

// Setup all Firebase listeners for the couple
function setupCoupleListeners(connectionCode) {
    coupleRef = window.firebaseDB.ref(`couples/${connectionCode}`);
    wallpapersRef = window.firebaseDB.ref(`wallpapers/${connectionCode}`);
    
    // Listen for wallpaper updates
    wallpapersRef.on('child_added', (snapshot) => {
        const wallpaper = snapshot.val();
        if (wallpaper.setBy !== appState.currentUser) {
            showNotification(`${appState.partner} updated the wallpaper! 💕`, "info");
            updateWallpaperPreview(wallpaper);
        }
    });
    
    // Setup presence system with real-time monitoring
    setupPresenceSystem(connectionCode);
    
    // Initialize chat
    if (typeof window.initializeChat === 'function') {
        window.initializeChat();
    }
}

// Setup presence system (online/offline status) - FIXED VERSION
function setupPresenceSystem(connectionCode) {
    const myPath = appState.role === 'creator' ? 'creator' : 'partner';
    const partnerPath = appState.role === 'creator' ? 'partner' : 'creator';
    
    presenceRef = coupleRef.child(myPath);
    partnerPresenceRef = coupleRef.child(partnerPath);
    
    // Set up Firebase presence detection
    const connectedRef = window.firebaseDB.ref('.info/connected');
    
    connectedRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
            // When connected, set online status
            presenceRef.update({
                isOnline: true,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
            
            // When disconnected, set offline status
            presenceRef.onDisconnect().update({
                isOnline: false,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });
    
    // Listen for partner's online status changes - REAL-TIME
    partnerPresenceRef.child('isOnline').on('value', (snapshot) => {
        const isOnline = snapshot.val();
        updatePartnerStatusUI(isOnline);
    });
    
    // Listen for partner's last seen changes
    partnerPresenceRef.child('lastSeen').on('value', (snapshot) => {
        const lastSeen = snapshot.val();
        if (lastSeen && !snapshot.ref.parent.child('isOnline').val()) {
            updatePartnerLastSeenUI(lastSeen);
        }
    });
    
    // Update last seen periodically when online
    setInterval(() => {
        if (appState.isConnected && presenceRef) {
            presenceRef.update({
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }
    }, 30000); // Update every 30 seconds
    
    // Update on visibility change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && presenceRef && appState.isConnected) {
            presenceRef.update({
                isOnline: true,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });
    
    // Initial status check
    partnerPresenceRef.once('value', (snapshot) => {
        const partnerData = snapshot.val();
        if (partnerData) {
            updatePartnerStatusUI(partnerData.isOnline);
        }
    });
}

// Update partner status UI
function updatePartnerStatusUI(isOnline) {
    const statusElement = document.getElementById('partnerStatus');
    const indicator = document.getElementById('statusIndicator');
    const chatStatusIndicator = document.getElementById('chatStatusIndicator');
    const chatPartnerStatus = document.getElementById('chatPartnerStatus');
    
    if (!appState.isConnected) {
        statusElement.textContent = 'Not connected';
        indicator.classList.add('offline');
        indicator.classList.remove('online');
        if (chatStatusIndicator) {
            chatStatusIndicator.classList.add('offline');
            chatStatusIndicator.classList.remove('online');
        }
        if (chatPartnerStatus) {
            chatPartnerStatus.textContent = 'Offline';
        }
        return;
    }
    
    if (isOnline) {
        statusElement.textContent = `${appState.partner} is online`;
        indicator.classList.remove('offline');
        indicator.classList.add('online');
        if (chatStatusIndicator) {
            chatStatusIndicator.classList.remove('offline');
            chatStatusIndicator.classList.add('online');
        }
        if (chatPartnerStatus) {
            chatPartnerStatus.textContent = 'Online';
        }
    } else {
        statusElement.textContent = `${appState.partner} was online recently`;
        indicator.classList.add('offline');
        indicator.classList.remove('online');
        if (chatStatusIndicator) {
            chatStatusIndicator.classList.add('offline');
            chatStatusIndicator.classList.remove('online');
        }
        if (chatPartnerStatus) {
            chatPartnerStatus.textContent = 'Offline';
        }
    }
}

// Update partner last seen UI
function updatePartnerLastSeenUI(timestamp) {
    const statusElement = document.getElementById('partnerStatus');
    const chatPartnerStatus = document.getElementById('chatPartnerStatus');
    
    if (!appState.isConnected) return;
    
    const timeAgo = formatTime(timestamp);
    statusElement.textContent = `${appState.partner} was online ${timeAgo}`;
    if (chatPartnerStatus) {
        chatPartnerStatus.textContent = `Last seen ${timeAgo}`;
    }
}

// Generate Connection Code
function generateConnectionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Copy Connection Code
function copyConnectionCode() {
    const code = document.getElementById('displayCode').textContent;
    const copyBtn = document.getElementById('copyCodeBtn');
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification("Code copied to clipboard! 📋", "success");
        copyBtn.style.transform = 'scale(1.2)';
        copyBtn.style.background = 'rgba(74, 222, 128, 0.3)';
        setTimeout(() => {
            copyBtn.style.transform = 'scale(1)';
            copyBtn.style.background = '';
        }, 300);
    }).catch(() => {
        showNotification("Failed to copy code 😢", "error");
    });
}

// Initialize App
function initializeApp() {
    if (appState.isConnected && appState.connectionCode) {
        setupCoupleListeners(appState.connectionCode);
    }
    loadCurrentWallpaper();
    updateNavActiveState('mainBtn');
}

// File Upload Handling
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processImageFile(file);
    } else {
        showNotification("Please select a valid image file! 🖼️", "warning");
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        processImageFile(files[0]);
    } else {
        showNotification("Please drop a valid image file! 🖼️", "warning");
    }
}

function processImageFile(file) {
    showNotification("Uploading your wallpaper... ⏳", "info");
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const imageUrl = e.target.result;
        await uploadWallpaperToFirebase(imageUrl, file.name);
    };
    reader.readAsDataURL(file);
}

// Upload wallpaper to Firebase
async function uploadWallpaperToFirebase(imageUrl, fileName) {
    if (!appState.isConnected || !appState.connectionCode) {
        showNotification("Please connect with your partner first! 💑", "warning");
        return;
    }
    
    try {
        const wallpaper = {
            id: Date.now(),
            url: imageUrl,
            title: fileName || 'Untitled',
            setBy: appState.currentUser,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            isActive: true
        };
        
        // Save to Firebase
        await wallpapersRef.push(wallpaper);
        
        // Update current wallpaper
        await coupleRef.update({
            currentWallpaper: wallpaper,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
        
        updateWallpaperPreview(wallpaper);
        showNotification("Wallpaper updated! Your partner will see it instantly 💕", "success");
        
    } catch (error) {
        console.error('Error uploading wallpaper:', error);
        showNotification("Failed to upload wallpaper. Please try again! 😢", "error");
    }
}

// Quick Actions
function handleCamera() {
    showNotification("Camera feature coming soon! 📷", "info");
}

function handleGallery() {
    document.getElementById('fileInput').click();
}

async function handleSurprise() {
    const surpriseBtn = document.getElementById('surpriseBtn');
    surpriseBtn.style.transform = 'rotate(360deg) scale(1.1)';
    setTimeout(() => {
        surpriseBtn.style.transform = 'rotate(0deg) scale(1)';
    }, 500);
    
    const surpriseImages = [
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop'
    ];
    
    const randomImage = surpriseImages[Math.floor(Math.random() * surpriseImages.length)];
    await uploadWallpaperToFirebase(randomImage, 'Surprise Wallpaper');
    showNotification("Surprise! Your partner will love this! ✨", "success");
}

// Update Wallpaper Preview
function updateWallpaperPreview(wallpaper) {
    const preview = document.getElementById('wallpaperPreview');
    const title = document.getElementById('wallpaperTitle');
    const meta = document.getElementById('wallpaperMeta');
    
    preview.style.opacity = '0.5';
    preview.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        preview.innerHTML = `<img src="${wallpaper.url}" alt="${wallpaper.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">`;
        title.textContent = wallpaper.title;
        meta.textContent = `Set by: ${wallpaper.setBy} • ${formatTime(wallpaper.timestamp)}`;
        
        preview.style.opacity = '1';
        preview.style.transform = 'scale(1)';
    }, 300);
}

function loadCurrentWallpaper() {
    if (!appState.isConnected || !appState.connectionCode) return;
    
    coupleRef.child('currentWallpaper').once('value', (snapshot) => {
        const wallpaper = snapshot.val();
        if (wallpaper) {
            updateWallpaperPreview(wallpaper);
        }
    });
}

// Load History
async function loadHistory() {
    const historyGrid = document.getElementById('historyGrid');
    historyGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;"><p>Loading history... ⏳</p></div>';
    
    if (!appState.isConnected || !appState.connectionCode) {
        historyGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.5); padding: 3rem;"><span style="font-size: 3rem; display: block; margin-bottom: 1rem;">💔</span><p>Please connect with your partner first!</p></div>';
        return;
    }
    
    try {
        const snapshot = await wallpapersRef.orderByChild('timestamp').limitToLast(20).once('value');
        const wallpapers = [];
        
        snapshot.forEach((child) => {
            wallpapers.unshift(child.val());
        });
        
        historyGrid.innerHTML = '';
        
        if (wallpapers.length === 0) {
            historyGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.5); padding: 3rem;">
                    <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">📚</span>
                    <p>No wallpapers yet. Start creating memories!</p>
                </div>
            `;
            return;
        }
        
        wallpapers.forEach((wallpaper, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.style.animationDelay = `${index * 0.1}s`;
            item.innerHTML = `
                <div class="item-image">
                    <img src="${wallpaper.url}" alt="${wallpaper.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="item-info">
                    <h4>${wallpaper.title}</h4>
                    <p>By ${wallpaper.setBy}</p>
                    <p>${formatTime(wallpaper.timestamp)}</p>
                </div>
            `;
            
            item.addEventListener('click', async () => {
                await uploadWallpaperToFirebase(wallpaper.url, wallpaper.title);
                showScreen('app');
                updateNavActiveState('mainBtn');
                showNotification("Wallpaper restored! 🔄", "success");
            });
            
            historyGrid.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error loading history:', error);
        historyGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.5); padding: 3rem;"><span style="font-size: 3rem; display: block; margin-bottom: 1rem;">😢</span><p>Failed to load history</p></div>';
    }
}

// Load Vault
function loadVault() {
    const vaultGrid = document.getElementById('vaultGrid');
    vaultGrid.innerHTML = '';
    
    const vaultItems = [
        { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop', title: 'Sunset Together' },
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', title: 'Ocean Dreams' },
        { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop', title: 'Mountain Love' },
        { url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop', title: 'City Lights' },
        { url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop', title: 'Starry Night' },
        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop', title: 'Nature Love' }
    ];
    
    vaultItems.forEach((item, index) => {
        const vaultItem = document.createElement('div');
        vaultItem.className = 'vault-item';
        vaultItem.style.animationDelay = `${index * 0.1}s`;
        vaultItem.innerHTML = `
            <div class="item-image">
                <img src="${item.url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="item-info">
                <h4>${item.title}</h4>
                <p>Shared memory</p>
            </div>
        `;
        
        vaultItem.addEventListener('click', async () => {
            await uploadWallpaperToFirebase(item.url, item.title);
            showScreen('app');
            updateNavActiveState('mainBtn');
            showNotification("Wallpaper set from vault! 💎", "success");
        });
        
        vaultGrid.appendChild(vaultItem);
    });
}

// Disconnect
async function handleDisconnect() {
    if (!confirm('Are you sure you want to disconnect? This will end your romantic sync and clear all chat messages! 💔')) {
        return;
    }
    
    try {
        // Update Firebase presence
        if (presenceRef) {
            await presenceRef.update({
                isOnline: false,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }
        
        // Clear chat messages
        if (appState.connectionCode) {
            await window.firebaseDB.ref(`chats/${appState.connectionCode}`).remove();
        }
        
        // Remove listeners
        if (coupleRef) coupleRef.off();
        if (wallpapersRef) wallpapersRef.off();
        if (presenceRef) presenceRef.off();
        if (partnerPresenceRef) partnerPresenceRef.off();
        
        // Cleanup chat
        if (typeof window.cleanupChat === 'function') {
            window.cleanupChat();
        }
        
        // Reset app state
        appState = {
            currentUser: null,
            partner: null,
            connectionCode: null,
            coupleId: null,
            isConnected: false,
            role: null,
            notifications: true,
            autoSync: true,
            lastSeen: Date.now()
        };
        
        saveAppState();
        showScreen('welcome');
        updateNavActiveState('mainBtn');
        showNotification("Disconnected. We hope you reconnect soon! 💔", "info");
        
    } catch (error) {
        console.error('Error disconnecting:', error);
        showNotification("Error disconnecting. Please try again! 😢", "error");
    }
}

// Notifications
function showNotification(message, type = 'info') {
    if (!appState.notifications && type !== 'error') return;
    
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    switch (type) {
        case 'success':
            notification.style.background = 'rgba(74, 222, 128, 0.9)';
            break;
        case 'warning':
            notification.style.background = 'rgba(251, 191, 36, 0.9)';
            break;
        case 'error':
            notification.style.background = 'rgba(239, 68, 68, 0.9)';
            break;
        default:
            notification.style.background = 'rgba(255, 107, 157, 0.9)';
    }
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.5s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 4000);
}

// Utility Functions
function formatTime(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return date.toLocaleDateString();
}

// State Management
function saveAppState() {
    try {
        localStorage.setItem('lovesync_state', JSON.stringify(appState));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function loadAppState() {
    try {
        const savedState = localStorage.getItem('lovesync_state');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            appState = { ...appState, ...parsed };
            
            if (appState.isConnected && appState.connectionCode) {
                showScreen('app');
                initializeApp();
                showNotification(`Welcome back! ${appState.partner} missed you 💕`, "success");
            }
            
            document.getElementById('notificationsToggle').checked = appState.notifications;
            document.getElementById('autoSyncToggle').checked = appState.autoSync;
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
}
