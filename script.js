// App State
let appState = {
    currentUser: null,
    partner: null,
    connectionCode: null,
    isConnected: false,
    wallpapers: [],
    notifications: true,
    autoSync: true
};

// DOM Elements
const screens = {
    welcome: document.getElementById('welcomeScreen'),
    create: document.getElementById('createScreen'),
    join: document.getElementById('joinScreen'),
    success: document.getElementById('successScreen'),
    app: document.getElementById('appScreen'),
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
    
    // Navigation with enhanced animations
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
            showNotification("Please connect with your partner first! 💝", "warning");
        }
    });
    
    document.getElementById('vaultBtn').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('vault');
            loadVault();
            updateNavActiveState('vaultBtn');
        } else {
            showNotification("Please connect with your partner first! 💝", "warning");
        }
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('settings');
            updateNavActiveState('settingsBtn');
        } else {
            showNotification("Please connect with your partner first! 💝", "warning");
        }
    });
    
    // Back buttons with enhanced functionality
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
    
    // Drag and drop with enhanced feedback
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Quick actions with enhanced animations
    document.getElementById('cameraBtn').addEventListener('click', handleCamera);
    document.getElementById('galleryBtn').addEventListener('click', handleGallery);
    document.getElementById('surpriseBtn').addEventListener('click', handleSurprise);
    
    // Settings with enhanced feedback
    document.getElementById('notificationsToggle').addEventListener('change', (e) => {
        appState.notifications = e.target.checked;
        saveAppState();
        showNotification(
            e.target.checked ? "Notifications enabled! 💕" : "Notifications disabled 🔕",
            "info"
        );
        // Add visual feedback
        e.target.parentElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            e.target.parentElement.style.transform = 'scale(1)';
        }, 200);
    });
    
    document.getElementById('autoSyncToggle').addEventListener('change', (e) => {
        appState.autoSync = e.target.checked;
        saveAppState();
        showNotification(
            e.target.checked ? "Auto-sync enabled! ✨" : "Auto-sync disabled 📱",
            "info"
        );
        // Add visual feedback
        e.target.parentElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            e.target.parentElement.style.transform = 'scale(1)';
        }, 200);
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

// Enhanced Screen Management
function showScreen(screenName) {
    // Add exit animation to current screen
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            currentScreen.classList.remove('active');
            currentScreen.style.animation = '';
        }, 300);
    }
    
    // Show new screen with entrance animation
    setTimeout(() => {
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }
    }, 300);
}

// Navigation Active State Management
function updateNavActiveState(activeBtn) {
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to current button
    if (activeBtn) {
        document.getElementById(activeBtn).classList.add('active');
    }
}

// Enhanced Create Couple
async function handleCreateCouple(e) {
    e.preventDefault();
    
    const createBtn = e.target.querySelector('.primary-btn');
    const userName = document.getElementById('createName').value.trim();
    const partnerName = document.getElementById('partnerName').value.trim();
    
    if (!userName || !partnerName) {
        showNotification("Please fill in both names! 💑", "warning");
        // Add shake animation to form
        e.target.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            e.target.style.animation = '';
        }, 500);
        return;
    }
    
    // Show loading with enhanced animation
    createBtn.classList.add('loading');
    createBtn.style.transform = 'scale(0.95)';
    
    // Simulate API call
    setTimeout(() => {
        const connectionCode = generateConnectionCode();
        
        appState.currentUser = userName;
        appState.partner = partnerName;
        appState.connectionCode = connectionCode;
        appState.isConnected = false;
        appState.role = 'creator'; // Mark as creator
        
        // Save connection info separately for validation
        const connectionInfo = {
            code: connectionCode,
            creator: userName,
            partnerName: partnerName,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(`lovesync_connection_${connectionCode}`, JSON.stringify(connectionInfo));
        
        saveAppState();
        
        // Show success screen
        document.getElementById('connectionMessage').textContent = 
            `Share the code below with ${partnerName} to connect your hearts!`;
        document.getElementById('displayCode').textContent = connectionCode;
        document.getElementById('codeDisplay').style.display = 'block';
        
        createBtn.classList.remove('loading');
        createBtn.style.transform = 'scale(1)';
        showScreen('success');
        
        showNotification("Connection code created! Share it with your love 💕", "success");
    }, 2000);
}

// Enhanced Join Couple
async function handleJoinCouple(e) {
    e.preventDefault();
    
    const joinBtn = e.target.querySelector('.primary-btn');
    const userName = document.getElementById('joinName').value.trim();
    const connectionCode = document.getElementById('connectionCode').value.trim();
    
    if (!userName || !connectionCode) {
        showNotification("Please fill in all fields! 💝", "warning");
        // Add shake animation to form
        e.target.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            e.target.style.animation = '';
        }, 500);
        return;
    }
    
    if (connectionCode.length !== 6) {
        showNotification("Connection code must be 6 digits! 🔢", "warning");
        document.getElementById('connectionCode').style.borderColor = '#ef4444';
        setTimeout(() => {
            document.getElementById('connectionCode').style.borderColor = '';
        }, 2000);
        return;
    }
    
    // Show loading with enhanced animation
    joinBtn.classList.add('loading');
    joinBtn.style.transform = 'scale(0.95)';
    
    // Simulate API call
    setTimeout(() => {
        // Check if code exists (simulate)
        const savedState = localStorage.getItem('lovesync_state');
        let isValidCode = false;
        
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.connectionCode === connectionCode) {
                isValidCode = true;
                appState.currentUser = userName;
                appState.partner = state.currentUser;
                appState.connectionCode = connectionCode;
                appState.isConnected = true;
            }
        }
        
        joinBtn.classList.remove('loading');
        joinBtn.style.transform = 'scale(1)';
        
        if (isValidCode) {
            document.getElementById('connectionMessage').textContent = 
                `Hearts connected! You and ${appState.partner} are now synced 💕`;
            document.getElementById('codeDisplay').style.display = 'none';
            
            saveAppState();
            showScreen('success');
            showNotification("Successfully connected! Your hearts are now in sync 💕", "success");
        } else {
            showNotification("Invalid connection code! Please check and try again 💔", "error");
            // Add error animation
            document.getElementById('connectionCode').style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                document.getElementById('connectionCode').style.animation = '';
            }, 500);
        }
    }, 2000);
}

// Generate Connection Code
function generateConnectionCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Enhanced Copy Connection Code
function copyConnectionCode() {
    const code = document.getElementById('displayCode').textContent;
    const copyBtn = document.getElementById('copyCodeBtn');
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification("Code copied to clipboard! 📋", "success");
        // Add success animation
        copyBtn.style.transform = 'scale(1.2)';
        copyBtn.style.background = 'rgba(74, 222, 128, 0.3)';
        setTimeout(() => {
            copyBtn.style.transform = 'scale(1)';
            copyBtn.style.background = '';
        }, 300);
    }).catch(() => {
        showNotification("Failed to copy code 😔", "error");
    });
}

// Initialize App
function initializeApp() {
    updatePartnerStatus();
    loadCurrentWallpaper();
    updateNavActiveState('mainBtn');
    
    // Simulate partner activity
    setInterval(() => {
        if (appState.isConnected && Math.random() > 0.7) {
            simulatePartnerActivity();
        }
    }, 30000);
}

// Enhanced File Upload Handling
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processImageFile(file);
        // Add success feedback
        document.getElementById('uploadArea').style.borderColor = '#4ade80';
        setTimeout(() => {
            document.getElementById('uploadArea').style.borderColor = '';
        }, 1000);
    } else {
        showNotification("Please select a valid image file! 🖼️", "warning");
        // Add error feedback
        document.getElementById('uploadArea').style.borderColor = '#ef4444';
        setTimeout(() => {
            document.getElementById('uploadArea').style.borderColor = '';
        }, 1000);
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
        // Add success feedback
        e.currentTarget.style.borderColor = '#4ade80';
        setTimeout(() => {
            e.currentTarget.style.borderColor = '';
        }, 1000);
    } else {
        showNotification("Please drop a valid image file! 🖼️", "warning");
        // Add error feedback
        e.currentTarget.style.borderColor = '#ef4444';
        setTimeout(() => {
            e.currentTarget.style.borderColor = '';
        }, 1000);
    }
}

function processImageFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        setWallpaper(imageUrl, file.name);
    };
    reader.readAsDataURL(file);
}

// Enhanced Quick Actions
function handleCamera() {
    const cameraBtn = document.getElementById('cameraBtn');
    // Add animation feedback
    cameraBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        cameraBtn.style.transform = 'scale(1)';
    }, 150);
    showNotification("Camera feature coming soon! 📷", "info");
}

function handleGallery() {
    const galleryBtn = document.getElementById('galleryBtn');
    // Add animation feedback
    galleryBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        galleryBtn.style.transform = 'scale(1)';
    }, 150);
    document.getElementById('fileInput').click();
}

function handleSurprise() {
    const surpriseBtn = document.getElementById('surpriseBtn');
    // Add animation feedback
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
    setWallpaper(randomImage, 'Surprise Wallpaper');
    showNotification("Surprise! Your partner will love this! ✨", "success");
}

// Enhanced Wallpaper Management
function setWallpaper(imageUrl, title) {
    const wallpaper = {
        id: Date.now(),
        url: imageUrl,
        title: title || 'Untitled',
        setBy: appState.currentUser,
        timestamp: new Date().toISOString(),
        isActive: true
    };
    
    // Deactivate previous wallpapers
    appState.wallpapers.forEach(w => w.isActive = false);
    
    // Add new wallpaper
    appState.wallpapers.unshift(wallpaper);
    
    // Update UI with animation
    updateWallpaperPreview(wallpaper);
    
    // Save state
    saveAppState();
    
    // Notify partner
    if (appState.isConnected) {
        showNotification(`Wallpaper updated! Your partner's heart just skipped a beat 💕`, "success");
        
        // Simulate partner notification
        setTimeout(() => {
            showNotification(`${appState.partner} loved your new wallpaper! 😍`, "info");
        }, 3000);
    }
}

function updateWallpaperPreview(wallpaper) {
    const preview = document.getElementById('wallpaperPreview');
    const title = document.getElementById('wallpaperTitle');
    const meta = document.getElementById('wallpaperMeta');
    
    // Add loading animation
    preview.style.opacity = '0.5';
    preview.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        preview.innerHTML = `<img src="${wallpaper.url}" alt="${wallpaper.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">`;
        title.textContent = wallpaper.title;
        meta.textContent = `Set by: ${wallpaper.setBy} • ${formatTime(wallpaper.timestamp)}`;
        
        // Restore animation
        preview.style.opacity = '1';
        preview.style.transform = 'scale(1)';
    }, 300);
}

function loadCurrentWallpaper() {
    const currentWallpaper = appState.wallpapers.find(w => w.isActive);
    if (currentWallpaper) {
        updateWallpaperPreview(currentWallpaper);
    }
}

// Enhanced History and Vault
function loadHistory() {
    const historyGrid = document.getElementById('historyGrid');
    historyGrid.innerHTML = '';
    
    if (appState.wallpapers.length === 0) {
        historyGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.5); padding: 3rem;">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">📚</span>
                <p>No wallpapers yet. Start creating memories!</p>
            </div>
        `;
        return;
    }
    
    appState.wallpapers.forEach((wallpaper, index) => {
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
        
        item.addEventListener('click', () => {
            // Add click animation
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
                setWallpaper(wallpaper.url, wallpaper.title);
                showScreen('app');
                updateNavActiveState('mainBtn');
                showNotification("Wallpaper restored! 🔄", "success");
            }, 150);
        });
        
        historyGrid.appendChild(item);
    });
}

function loadVault() {
    const vaultGrid = document.getElementById('vaultGrid');
    vaultGrid.innerHTML = '';
    
    // Simulate vault items
    const vaultItems = [
        { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop', title: 'Sunset Together' },
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', title: 'Ocean Dreams' },
        { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop', title: 'Mountain Love' },
        { url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop', title: 'City Lights' }
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
        
        vaultItem.addEventListener('click', () => {
            // Add click animation
            vaultItem.style.transform = 'scale(0.95)';
            setTimeout(() => {
                vaultItem.style.transform = 'scale(1)';
                setWallpaper(item.url, item.title);
                showScreen('app');
                updateNavActiveState('mainBtn');
                showNotification("Wallpaper set from vault! 💝", "success");
            }, 150);
        });
        
        vaultGrid.appendChild(vaultItem);
    });
}

// Partner Status
function updatePartnerStatus() {
    const statusElement = document.getElementById('partnerStatus');
    const indicator = document.querySelector('.status-indicator');
    
    if (appState.isConnected) {
        const isOnline = Math.random() > 0.3; // Simulate online status
        
        if (isOnline) {
            statusElement.textContent = `${appState.partner} is online`;
            indicator.classList.remove('offline');
        } else {
            statusElement.textContent = `${appState.partner} was online 5 min ago`;
            indicator.classList.add('offline');
        }
    } else {
        statusElement.textContent = 'Not connected';
        indicator.classList.add('offline');
    }
}

// Simulate Partner Activity
function simulatePartnerActivity() {
    const activities = [
        `${appState.partner} is looking at your photos 👀`,
        `${appState.partner} sent you a virtual hug 🤗`,
        `${appState.partner} is thinking of you 💭`,
        `${appState.partner} just smiled at your wallpaper 😊`,
        `${appState.partner} misses you 💕`
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    showNotification(randomActivity, "info");
}

// Enhanced Disconnect
function handleDisconnect() {
    const disconnectBtn = document.getElementById('disconnectBtn');
    
    // Add animation feedback
    disconnectBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        disconnectBtn.style.transform = 'scale(1)';
    }, 150);
    
    if (confirm('Are you sure you want to disconnect? This will end your romantic sync! 💔')) {
        appState = {
            currentUser: null,
            partner: null,
            connectionCode: null,
            isConnected: false,
            wallpapers: [],
            notifications: true,
            autoSync: true
        };
        
        saveAppState();
        showScreen('welcome');
        updateNavActiveState('mainBtn');
        showNotification("Disconnected. We hope you reconnect soon! 💔", "info");
    }
}

// Enhanced Notifications
function showNotification(message, type = 'info') {
    if (!appState.notifications && type !== 'error') return;
    
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add type-specific styling
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
    
    // Auto remove after 4 seconds with enhanced animation
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
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
}

// State Management
function saveAppState() {
    localStorage.setItem('lovesync_state', JSON.stringify(appState));
}

function loadAppState() {
    const savedState = localStorage.getItem('lovesync_state');
    if (savedState) {
        appState = { ...appState, ...JSON.parse(savedState) };
        
        // If connected, go directly to app
        if (appState.isConnected) {
            showScreen('app');
            initializeApp();
            showNotification(`Welcome back! ${appState.partner} missed you 💕`, "success");
        }
        
        // Update settings UI
        document.getElementById('notificationsToggle').checked = appState.notifications;
        document.getElementById('autoSyncToggle').checked = appState.autoSync;
    }
}

// Add CSS for additional animations
const additionalStyles = `
@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(-20px) scale(0.95); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Periodic updates
setInterval(() => {
    if (appState.isConnected) {
        updatePartnerStatus();
    }
}, 60000);

// Add some romantic touches
setInterval(() => {
    if (appState.isConnected && Math.random() > 0.95) {
        const romanticMessages = [
            "Your love connection is strong 💪💕",
            "Distance means nothing when hearts are connected 💝",
            "Your partner is thinking of you right now 💭",
            "Love is in the air... and in your wallpapers! 🌸"
        ];
        
        const randomMessage = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];
        showNotification(randomMessage, "info");
    }
}, 120000);
