const API_URL = 'https://rarely-optics-nova-continue.trycloudflare.com';

// Get token from localStorage
const token = localStorage.getItem('token');

// Check if user is logged in
if (!token) {
    window.location.href = 'login.html';
}

// Load dashboard data
function loadDashboard() {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update welcome message
    document.getElementById('welcomeText').textContent = `Welcome back, ${user.name || 'User'}!`;
    
    // Load profile data from API
    fetch(`${API_URL}/user/dashboard`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(function(response) {
        if (response.status === 401) {
            logout();
            return;
        }
        return response.json();
    })
    .then(function(data) {
        if (data && data.success) {
            const userData = data.data.user;
            
            // Update profile details
            document.getElementById('profileName').textContent = userData.name || '-';
            document.getElementById('profileEmail').textContent = userData.email || '-';
            document.getElementById('profileUsername').textContent = userData.username || '-';
            document.getElementById('profileAge').textContent = userData.age || '-';
            document.getElementById('profileGender').textContent = userData.gender || '-';
            document.getElementById('profileMobile').textContent = userData.mobile_number || '-';
            
            // Format date
            if (userData.created_at) {
                const date = new Date(userData.created_at);
                document.getElementById('profileCreated').textContent = date.toLocaleDateString('en-IN');
            }
        } else if (data && !data.success) {
            if (data.message === 'Invalid or expired token') {
                logout();
            }
            showMessage('Error loading profile: ' + data.message, 'error');
        }
    })
    .catch(function(error) {
        showMessage('Error: ' + error.message, 'error');
    });
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    logout();
});

function logout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.user-info');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(function() {
        messageDiv.remove();
    }, 3000);
}

// Load dashboard on page load
loadDashboard();