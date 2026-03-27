const API_URL = 'https://rarely-optics-nova-continue.trycloudflare.com';

// Get token from localStorage
const token = localStorage.getItem('token');

// Check if user is logged in
if (!token) {
    window.location.href = 'login.html';
}

// DOM Elements - Cache for faster access
const elements = {
    welcomeText: document.getElementById('welcomeText'),
    profileName: document.getElementById('profileName'),
    profileEmail: document.getElementById('profileEmail'),
    profileUsername: document.getElementById('profileUsername'),
    profileAge: document.getElementById('profileAge'),
    profileGender: document.getElementById('profileGender'),
    profileMobile: document.getElementById('profileMobile'),
    profileCreated: document.getElementById('profileCreated')
};

// ============ IMMEDIATE DATA DISPLAY (NO WAITING) ============
// Show user data from localStorage instantly
function showInstantData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update welcome message instantly
    if (elements.welcomeText) {
        elements.welcomeText.textContent = `Welcome back, ${user.name || 'User'}!`;
    }
    
    // Show profile data from localStorage immediately
    if (elements.profileName) elements.profileName.textContent = user.name || '-';
    if (elements.profileEmail) elements.profileEmail.textContent = user.email || '-';
    if (elements.profileUsername) elements.profileUsername.textContent = user.username || '-';
    if (elements.profileAge) elements.profileAge.textContent = user.age || '-';
    if (elements.profileGender) elements.profileGender.textContent = user.gender || '-';
    if (elements.profileMobile) elements.profileMobile.textContent = user.mobile_number || '-';
    
    // Show loading indicator for fields that might update
    showLoadingIndicator();
}

// Show subtle loading indicator
function showLoadingIndicator() {
    const loadingFields = ['profileAge', 'profileGender', 'profileMobile', 'profileCreated'];
    loadingFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element && element.textContent === '-') {
            element.innerHTML = '<span class="loading-dots">...</span>';
        }
    });
}

// ============ FETCH FRESH DATA IN BACKGROUND ============
async function fetchFreshData() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_URL}/api/user/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.success) {
            const userData = data.data.user;
            
            // Update UI with fresh data
            updateUIWithFreshData(userData);
            
            // Update localStorage for next time
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } else if (data && !data.success && data.message === 'Invalid or expired token') {
            logout();
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request timeout, showing cached data');
        } else {
            console.log('Background fetch error:', error.message);
        }
        // Don't show error to user - we already have localStorage data
    }
}

// Update UI with fresh data (smooth transition)
function updateUIWithFreshData(userData) {
    if (!userData) return;
    
    // Smooth update without flicker
    requestAnimationFrame(() => {
        if (elements.profileName && elements.profileName.textContent !== userData.name) {
            elements.profileName.textContent = userData.name || '-';
        }
        if (elements.profileEmail && elements.profileEmail.textContent !== userData.email) {
            elements.profileEmail.textContent = userData.email || '-';
        }
        if (elements.profileUsername && elements.profileUsername.textContent !== userData.username) {
            elements.profileUsername.textContent = userData.username || '-';
        }
        if (elements.profileAge && elements.profileAge.textContent !== String(userData.age || '-')) {
            elements.profileAge.textContent = userData.age || '-';
        }
        if (elements.profileGender && elements.profileGender.textContent !== (userData.gender || '-')) {
            elements.profileGender.textContent = userData.gender || '-';
        }
        if (elements.profileMobile && elements.profileMobile.textContent !== (userData.mobile_number || '-')) {
            elements.profileMobile.textContent = userData.mobile_number || '-';
        }
        
        if (userData.created_at && elements.profileCreated) {
            const formattedDate = new Date(userData.created_at).toLocaleDateString('en-IN');
            if (elements.profileCreated.textContent !== formattedDate) {
                elements.profileCreated.textContent = formattedDate;
            }
        }
    });
}

// ============ LOGOUT FUNCTION ============
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('login.html');
}

// ============ SHOW MESSAGE ============
let messageTimeout;
function showMessage(message, type) {
    if (messageTimeout) clearTimeout(messageTimeout);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.user-info');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        messageTimeout = setTimeout(() => messageDiv.remove(), 3000);
    }
}

// ============ EVENT LISTENERS ============
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// ============ INITIALIZE DASHBOARD ============
// Step 1: Show data from localStorage IMMEDIATELY
showInstantData();

// Step 2: Fetch fresh data in background (doesn't block UI)
fetchFreshData();