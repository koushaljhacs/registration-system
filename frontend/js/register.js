const API_URL = 'https://rarely-optics-nova-continue.trycloudflare.com';

let currentEmail = '';
let otpVerified = false;

// DOM Elements
const emailInput = document.getElementById('email');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const otpSection = document.getElementById('otpSection');
const otpCodeInput = document.getElementById('otpCode');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const passwordSection = document.getElementById('passwordSection');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const registerForm = document.getElementById('registerForm');

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
}

// Enable/disable Send OTP button based on email
emailInput.addEventListener('input', function() {
    const email = emailInput.value.trim();
    if (isValidEmail(email)) {
        sendOtpBtn.disabled = false;
    } else {
        sendOtpBtn.disabled = true;
    }
});

// Send OTP
sendOtpBtn.addEventListener('click', function() {
    const email = emailInput.value.trim();
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    currentEmail = email;
    
    // Show loading state
    const originalText = sendOtpBtn.textContent;
    sendOtpBtn.textContent = 'Sending...';
    sendOtpBtn.disabled = true;
    
    // Send OTP request
    fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: currentEmail })
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
        } else {
            showAlert(data.message || 'Failed to send OTP', 'error');
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

// Verify OTP
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
    
    fetch(`${API_URL}/api/auth/verify-otp-only`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
            sendOtpBtn.disabled = true;
            emailInput.disabled = true;
            
            // Show password section
            passwordSection.style.display = 'block';
            passwordInput.disabled = false;
            passwordInput.focus();
            
            // Show submit button
            submitBtn.style.display = 'block';
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

// Handle form submission
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!otpVerified) {
        showAlert('Please verify OTP first', 'error');
        return;
    }
    
    const password = passwordInput.value.trim();
    
    if (!password || password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get all form data
    const formData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        mobile_number: document.getElementById('mobile').value,
        email: currentEmail,
        password: password
    };
    
    // Validate all fields
    if (!formData.name || !formData.age || !formData.gender || !formData.mobile_number) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    // Show loading
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;
    
    // Send registration request
    fetch(`${API_URL}/api/auth/register-with-verified-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        submitBtn.textContent = 'Complete Registration';
        submitBtn.disabled = false;
        
        if (data.success) {
            // Show success message
            showSuccessAndRedirect('✅ Registration Successful! Username and password sent to your email. Redirecting to login page...');
            
            // Clear form
            registerForm.reset();
            
            // Redirect to login after 3 seconds
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(function(error) {
        submitBtn.textContent = 'Complete Registration';
        submitBtn.disabled = false;
        showAlert('Error: ' + error.message, 'error');
    });
});

// Show success message with redirect
function showSuccessAndRedirect(message) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; min-width: 300px; text-align: center;';
    successDiv.innerHTML = message;
    document.body.appendChild(successDiv);
    
    // Disable all form inputs
    const inputs = registerForm.querySelectorAll('input, button, select');
    inputs.forEach(input => input.disabled = true);
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const form = document.getElementById('registerForm');
    form.insertBefore(alertDiv, form.firstChild);
    
    setTimeout(function() {
        alertDiv.remove();
    }, 3000);
}