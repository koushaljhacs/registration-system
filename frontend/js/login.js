const API_URL = 'https://rarely-optics-nova-continue.trycloudflare.com';


// Handle login form
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usernameOrEmail = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Show loading
    const submitBtn = e.target.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    // Send login request
    fetch(`${API_URL}/auth/login-with-username`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username_or_email: usernameOrEmail,
            password: password
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            // Save token to localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(function(error) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showAlert('Error: ' + error.message, 'error');
    });
});

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(alertDiv, form.firstChild);
    
    setTimeout(function() {
        alertDiv.remove();
    }, 3000);
}

// Check if already logged in
const token = localStorage.getItem('token');
if (token) {
    window.location.href = 'dashboard.html';
}