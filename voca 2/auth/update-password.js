// Initialize Supabase client
let supabase;

// Wait for the Supabase client to be loaded
function initSupabase() {
    if (typeof supabaseClient !== 'undefined') {
        supabase = supabaseClient;
    } else {
        supabase = supabase.createClient(
            'https://tkiqqpqplbgrebcbsiop.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRraXFxcHFwbGJncmViY2JzaW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzM3MzYsImV4cCI6MjA2MzA0OTczNn0.FJ0C0d4PYJTTUSL55tDroIpz5jcW9gvYX9eSKoB3Iz4'
        );
    }
    return supabase;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI elements
    const form = document.getElementById('updatePasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const successMessage = document.getElementById('successMessage');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const passwordStrength = document.getElementById('passwordStrength');
    const authContent = document.querySelector('.auth-content');
    
    // Hide form and success message by default
    if (form) form.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
    
    // Show loading while initializing
    showLoading();
    
    // Initialize Supabase
    supabase = initSupabase();
    
    // Check for error in URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const error = params.get('error');
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    // If there's an error in the URL, show it immediately
    if (error) {
        showTokenError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        hideLoading();
        return;
    }
    
    // Check for token in URL
    if (!accessToken || !refreshToken || type !== 'recovery') {
        throw new Error('Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu gửi lại email.');
    }
        
    try {
        // Try to set session with the recovery tokens
        const { error: authError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        
        if (authError) throw authError;
        
        // Clear the URL hash to remove sensitive data
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.error('Token validation error:', error);
        showTokenError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        return;
    }
    
    // If we get here, we have a valid session
    // Show the form
    if (form) form.style.display = 'block';
    
    // Hide loading
    hideLoading();
    
    // Function to show token error
    function showTokenError(message) {
        // Hide form and loading
        if (form) form.style.display = 'none';
        hideLoading();
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.margin = '20px 0';
        errorDiv.style.color = 'var(--danger)';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px; color: var(--danger);"></i>
            <h3>${message}</h3>
            <p>Vui lòng yêu cầu gửi lại email đặt lại mật khẩu.</p>
            <a href="auth-reset-password.html" class="btn" style="margin-top: 16px; display: inline-flex; width: auto; padding: 8px 24px;">
                <i class="fas fa-redo"></i>
                <span style="margin-left: 8px;">Gửi lại email đặt lại mật khẩu</span>
            </a>
        `;
        
        // Insert error message before the back to login link
        const backToLogin = document.querySelector('.back-to-login');
        if (authContent && backToLogin) {
            authContent.insertBefore(errorDiv, backToLogin);
        } else if (authContent) {
            authContent.appendChild(errorDiv);
        }
    }
    
    // Password strength requirements
    const requirements = {
        length: document.getElementById('lengthReq'),
        number: document.getElementById('numberReq'),
        letter: document.getElementById('letterReq')
    };
    
    // Show loading indicator
    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
    
    // Hide loading indicator
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    // Show error message
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Hide error message
    function hideError(element) {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    
    // Check password strength
    function checkPasswordStrength(password) {
        // Reset requirements
        Object.values(requirements).forEach(req => {
            req.classList.remove('valid');
            req.querySelector('i').className = 'fas fa-circle';
        });
        
        // Check length
        const hasLength = password.length >= 8;
        if (hasLength) {
            requirements.length.classList.add('valid');
            requirements.length.querySelector('i').className = 'fas fa-check-circle';
        }
        
        // Check for number
        const hasNumber = /\d/.test(password);
        if (hasNumber) {
            requirements.number.classList.add('valid');
            requirements.number.querySelector('i').className = 'fas fa-check-circle';
        }
        
        // Check for letter
        const hasLetter = /[a-zA-Z]/.test(password);
        if (hasLetter) {
            requirements.letter.classList.add('valid');
            requirements.letter.querySelector('i').className = 'fas fa-check-circle';
        }
        
        // Calculate strength
        let strength = 0;
        if (hasLength) strength++;
        if (hasNumber) strength++;
        if (hasLetter) strength++;
        
        // Update strength meter
        if (passwordStrength) {
            passwordStrength.className = 'strength-meter';
            if (password.length > 0) {
                if (strength === 1) {
                    passwordStrength.classList.add('strength-weak');
                } else if (strength === 2) {
                    passwordStrength.classList.add('strength-medium');
                } else if (strength === 3) {
                    passwordStrength.classList.add('strength-strong');
                }
            }
        }
        
        return strength === 3; // Return true if all requirements are met
    }
    
    // Password input event listener
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            hideError(passwordError);
            const password = e.target.value;
            checkPasswordStrength(password);
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset errors
            hideError(passwordError);
            hideError(confirmPasswordError);
            
            // Get form values
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            
            // Validate password
            if (!password) {
                showError(passwordError, 'Vui lòng nhập mật khẩu mới');
                return false;
            }
            
            // Check password strength
            const isPasswordStrong = checkPasswordStrength(password);
            if (!isPasswordStrong) {
                showError(passwordError, 'Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.');
                return false;
            }
            
            // Validate confirm password
            if (!confirmPassword) {
                showError(confirmPasswordError, 'Vui lòng xác nhận mật khẩu');
                return false;
            }
            
            if (password !== confirmPassword) {
                showError(confirmPasswordError, 'Mật khẩu xác nhận không khớp');
                return false;
            }
            
            // Show loading indicator
            showLoading();
            
            try {
                
                // Update the password
                const { error: updateError } = await supabase.auth.updateUser({
                    password: password
                });
                
                if (updateError) throw updateError;
                
                // Show success message
                if (successMessage) {
                    form.style.display = 'none';
                    successMessage.style.display = 'block';
                }
                
            } catch (error) {
                console.error('Password update error:', error);
                let errorMessage = 'Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại sau.';
                
                if (error.message) {
                    if (error.message.includes('invalid token') || error.message.includes('expired')) {
                        errorMessage = 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email đặt lại mật khẩu.';
                    } else {
                        errorMessage = error.message;
                    }
                }
                
                showError(passwordError, errorMessage);
            } finally {
                // Hide loading indicator
                hideLoading();
            }
            
            return false;
        });
    }
});
