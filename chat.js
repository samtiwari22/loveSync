// Chat Module - Real-time chat functionality
let chatRef = null;
let messagesRef = null;
let typingRef = null;
let typingTimeout = null;
let unreadCount = 0;
let isTyping = false;
let currentScreen = 'welcome';

// Initialize chat when connection is established
function initializeChat() {
    if (!appState.isConnected || !appState.connectionCode) {
        console.log('Cannot initialize chat - not connected');
        return;
    }

    chatRef = window.firebaseDB.ref(`chats/${appState.connectionCode}`);
    messagesRef = chatRef.child('messages');
    typingRef = chatRef.child('typing');

    // Listen for new messages
    messagesRef.on('child_added', handleNewMessage);

    // Listen for typing indicator
    const partnerPath = appState.role === 'creator' ? 'joiner' : 'creator';
    typingRef.child(partnerPath).on('value', handlePartnerTyping);

    // Load existing messages
    loadChatMessages();

    console.log('✅ Chat initialized');
}

// Handle new message
function handleNewMessage(snapshot) {
    const message = snapshot.val();
    if (!message) return;

    // Check if we're not on chat screen and message is from partner
    if (currentScreen !== 'chat' && message.sender !== appState.currentUser) {
        unreadCount++;
        updateChatBadge();
        
        if (appState.notifications) {
            showNotification(`${message.sender}: ${message.text.substring(0, 30)}...`, 'info');
        }
    }

    // If on chat screen, display the message
    if (currentScreen === 'chat') {
        displayMessage(message);
        scrollToBottom();
    }
}

// Handle partner typing indicator
function handlePartnerTyping(snapshot) {
    const typingData = snapshot.val();
    const typingIndicator = document.getElementById('typingIndicator');
    const typingName = document.getElementById('typingName');

    if (typingData && typingData.isTyping && currentScreen === 'chat') {
        typingName.textContent = appState.partner;
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    } else {
        typingIndicator.style.display = 'none';
    }
}

// Load existing chat messages
async function loadChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '<div class="chat-loading">Loading messages... ⏳</div>';

    try {
        const snapshot = await messagesRef.orderByChild('timestamp').once('value');
        chatMessages.innerHTML = '';

        if (!snapshot.exists()) {
            chatMessages.innerHTML = `
                <div class="chat-empty">
                    <span class="empty-icon">💬</span>
                    <p>No messages yet. Say hi to your love! 💕</p>
                </div>
            `;
            return;
        }

        let lastDate = null;
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            
            // Add date divider if day changes
            const messageDate = new Date(message.timestamp).toDateString();
            if (messageDate !== lastDate) {
                addDateDivider(messageDate);
                lastDate = messageDate;
            }

            displayMessage(message, false);
        });

        scrollToBottom();
    } catch (error) {
        console.error('Error loading messages:', error);
        chatMessages.innerHTML = `
            <div class="chat-empty">
                <span class="empty-icon">😢</span>
                <p>Failed to load messages</p>
            </div>
        `;
    }
}

// Display a single message
function displayMessage(message, animate = true) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove empty state if present
    const emptyState = chatMessages.querySelector('.chat-empty');
    if (emptyState) {
        emptyState.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === appState.currentUser ? 'sent' : 'received'}`;
    
    if (!animate) {
        messageDiv.style.animation = 'none';
    }

    const avatar = message.sender === appState.currentUser ? '💕' : '💖';
    const time = formatMessageTime(message.timestamp);

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-bubble">
                <p class="message-text">${escapeHtml(message.text)}</p>
            </div>
            <div class="message-info">
                <span class="message-time">${time}</span>
                ${message.sender === appState.currentUser ? '<span class="message-status">✓✓</span>' : ''}
            </div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
}

// Add date divider
function addDateDivider(dateString) {
    const chatMessages = document.getElementById('chatMessages');
    const divider = document.createElement('div');
    divider.className = 'date-divider';
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let displayDate = dateString;
    if (dateString === today) {
        displayDate = 'Today';
    } else if (dateString === yesterday) {
        displayDate = 'Yesterday';
    } else {
        displayDate = new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
    
    divider.innerHTML = `<span>${displayDate}</span>`;
    chatMessages.appendChild(divider);
}

// Send message
async function sendMessage(text) {
    if (!text || !text.trim()) return;
    if (!appState.isConnected || !appState.connectionCode) {
        showNotification('Please connect with your partner first! 💑', 'warning');
        return;
    }

    const message = {
        text: text.trim(),
        sender: appState.currentUser,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };

    try {
        await messagesRef.push(message);
        
        // Stop typing indicator
        updateTypingStatus(false);
        
        // Clear input
        document.getElementById('chatInput').value = '';
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message. Please try again! 😢', 'error');
    }
}

// Update typing status
function updateTypingStatus(isTyping) {
    if (!appState.isConnected || !typingRef) return;

    const myPath = appState.role === 'creator' ? 'creator' : 'joiner';
    
    typingRef.child(myPath).set({
        isTyping: isTyping,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// Clear chat
async function clearChat() {
    if (!confirm('Are you sure you want to clear all chat messages? This action cannot be undone! 💔')) {
        return;
    }

    try {
        await messagesRef.remove();
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="chat-empty">
                <span class="empty-icon">💬</span>
                <p>Chat cleared. Start fresh! 💕</p>
            </div>
        `;

        showNotification('Chat cleared successfully! 🗑️', 'success');
    } catch (error) {
        console.error('Error clearing chat:', error);
        showNotification('Failed to clear chat. Please try again! 😢', 'error');
    }
}

// Update chat badge
function updateChatBadge() {
    const badge = document.getElementById('chatBadge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Reset unread count
function resetUnreadCount() {
    unreadCount = 0;
    updateChatBadge();
}

// Scroll to bottom of chat
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Format message time
function formatMessageTime(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    
    const today = now.toDateString();
    const messageDate = date.toDateString();
    
    if (messageDate === today) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Chat button
    document.getElementById('chatBtn').addEventListener('click', () => {
        if (appState.isConnected) {
            showScreen('chat');
            currentScreen = 'chat';
            updateNavActiveState('chatBtn');
            resetUnreadCount();
            loadChatMessages();
        } else {
            showNotification('Please connect with your partner first! 💑', 'warning');
        }
    });

    // Back from chat
    document.getElementById('backFromChat').addEventListener('click', () => {
        showScreen('app');
        currentScreen = 'app';
        updateNavActiveState('mainBtn');
    });

    // Chat form submission
    document.getElementById('chatForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (text) {
            sendMessage(text);
        }
    });

    // Typing indicator
    document.getElementById('chatInput').addEventListener('input', (e) => {
        const text = e.target.value;
        
        if (text && text.trim()) {
            if (!isTyping) {
                isTyping = true;
                updateTypingStatus(true);
            }
            
            // Clear previous timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Stop typing after 2 seconds of inactivity
            typingTimeout = setTimeout(() => {
                isTyping = false;
                updateTypingStatus(false);
            }, 2000);
        } else {
            if (isTyping) {
                isTyping = false;
                updateTypingStatus(false);
            }
        }
    });

    // Clear chat button
    document.getElementById('clearChatBtn').addEventListener('click', clearChat);

    // Emoji button
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });

    // Emoji selection
    document.querySelectorAll('.emoji-item').forEach(emoji => {
        emoji.addEventListener('click', () => {
            const input = document.getElementById('chatInput');
            input.value += emoji.textContent;
            input.focus();
            emojiPicker.style.display = 'none';
        });
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.style.display = 'none';
        }
    });

    // Track current screen
    const originalShowScreen = window.showScreen;
    window.showScreen = function(screenName) {
        currentScreen = screenName;
        if (screenName === 'chat') {
            resetUnreadCount();
        }
        originalShowScreen(screenName);
    };
});

// Clean up on disconnect
function cleanupChat() {
    if (messagesRef) {
        messagesRef.off();
        messagesRef = null;
    }
    if (typingRef) {
        typingRef.off();
        typingRef = null;
    }
    if (chatRef) {
        chatRef.off();
        chatRef = null;
    }
    unreadCount = 0;
    updateChatBadge();
    console.log('Chat cleanup complete');
}

// Export functions for use in script.js
window.initializeChat = initializeChat;
window.cleanupChat = cleanupChat;