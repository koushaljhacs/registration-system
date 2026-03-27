const API_URL = 'https://rarely-optics-nova-continue.trycloudflare.com';


let currentUsername = '';
let currentEmail = '';
let otpVerified = false;

// DOM Elements
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const otpSection = document.getElementById('otpSection');
const otpCodeInput = document.getElementById('otpCode');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
}

// Check credentials and enable send OTP
function checkCredentials() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (username && isValidEmail(email)) {
        sendOtpBtn.disabled = false;
    } else {
        sendOtpBtn.disabled = true;
    }
}

usernameInput.addEventListener('input', checkCredentials);
emailInput.addEventListener('input', checkCredentials);

// Send OTP for password reset
sendOtpBtn.addEventListener('click', function() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!username || !isValidEmail(email)) {
        showAlert('Please enter valid username and email', 'error');
        return;
    }
    
    currentUsername = username;
    currentEmail = email;
    
    // Show loading state
    const originalText = sendOtpBtn.textContent;
    sendOtpBtn.textContent = 'Sending...';
    sendOtpBtn.disabled = true;
    
    // Send OTP request
    fetch(`${API_URL}/auth/forgot-password-send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: currentUsername, email: currentEmail })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        sendOtpBtn.textContent = originalText;
        sendOtpBtn.disabled = false;
        
        if (data.success) {
            showAlert('OTP sent to your email!', 'success');
            // Show OTP section
            otpSection.style.display = 'block';
            otpCodeInput.focus();
            // Enable verify button
            verifyOtpBtn.disabled = false;
            // Disable username and email
            usernameInput.disabled = true;
            emailInput.disabled = true;
            sendOtpBtn.disabled = true;
        } else {
            showAlert(data.message || 'Failed to send OTP', 'error');
            sendOtpBtn.disabled = false;
        }
    })
    .catch(function(error) {
        sendOtpBtn.textContent = originalText;
        sendOtpBtn.disabled = false;
        showAlert('Error: ' + error.message, 'error');
    });
});

// OTP input validation - enable verify button when 6 digits entered
otpCodeInput.addEventListener('input', function() {
    const otp = otpCodeInput.value.trim();
    if (otp.length === 6 && /^\d+$/.test(otp)) {
        verifyOtpBtn.disabled = false;
    } else {
        verifyOtpBtn.disabled = true;
    }
});

// Verify OTP for password reset
verifyOtpBtn.addEventListener('click', function() {
    const otpCode = otpCodeInput.value.trim();
    
    if (!otpCode || otpCode.length !== 6) {
        showAlert('Please enter a valid 6-digit OTP', 'error');
        return;
    }
    
    // Show loading state
    const originalText = verifyOtpBtn.textContent;
    verifyOtpBtn.textContent = 'Verifying...';
    verifyOtpBtn.disabled = true;
    
    fetch(`${API_URL}/auth/forgot-password-verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: currentUsername,
            email: currentEmail,
            otp_code: otpCode
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        verifyOtpBtn.textContent = originalText;
        
        if (data.success) {
            showAlert('OTP verified successfully!', 'success');
            otpVerified = true;
            
            // Disable OTP inputs
            otpCodeInput.disabled = true;
            verifyOtpBtn.disabled = true;
            
            // Show reset password modal
            document.getElementById('resetModal').style.display = 'flex';
        } else {
            showAlert(data.message, 'error');
            verifyOtpBtn.disabled = false;
        }
    })
    .catch(function(error) {
        verifyOtpBtn.textContent = originalText;
        verifyOtpBtn.disabled = false;
        showAlert('Error: ' + error.message, 'error');
    });
});

// Handle password reset
document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || newPassword.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;
    
    fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: currentUsername,
            email: currentEmail,
            new_password: newPassword
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            showAlert('Password reset successful! Redirecting to login...', 'success');
            document.getElementById('resetModal').style.display = 'none';
            
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 2000);
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('resetModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Show alert message
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const form = document.getElementById('forgotPasswordForm');
    form.insertBefore(alertDiv, form.firstChild);
    
    setTimeout(function() {
        alertDiv.remove();
    }, 3000);
}