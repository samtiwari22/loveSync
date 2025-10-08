// Firebase Configuration
// IMPORTANT: Replace these with your own Firebase project credentials
// Get these from: https://console.firebase.google.com/

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-o4seFU0uO9oOk-IMhp0982VsJm1IZPU",
  authDomain: "lovesync-9ee1a.firebaseapp.com",
  databaseURL: "https://lovesync-9ee1a-default-rtdb.asia-southeast1.firebasedatabase.app/", // ADD THIS LINE - IMPORTANT!
  projectId: "lovesync-9ee1a",
  storageBucket: "lovesync-9ee1a.firebasestorage.app",
  messagingSenderId: "331631380041",
  appId: "1:331631380041:web:602ce113c137dfd0076198"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    alert('Failed to connect to Firebase. Please check your configuration.');
}

// Initialize Firebase services
const database = firebase.database();
const storage = firebase.storage();

// Export for use in other files
window.firebaseDB = database;
window.firebaseStorage = storage;
window.firebase = firebase;

// Connection status monitoring
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
        console.log('🟢 Connected to Firebase');
    } else {
        console.log('🔴 Disconnected from Firebase');
    }
});