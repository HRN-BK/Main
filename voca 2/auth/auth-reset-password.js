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

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    supabase = initSupabase();
    
    const form = document.getElementById('resetPasswordForm');
    const emailInput = document.getElementById('email');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorElement = document.getElementById('emailError');
    const successMessage = document.getElementById('successMessage');
    
    // Hiển thị lỗi
    function showError(message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    // Ẩn lỗi
    function hideError() {
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    // Hiển thị loading
    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
    
    // Ẩn loading
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        // Prevent default form submission
        e.preventDefault();
        
        // Reset errors and hide success message
        hideError();
        if (successMessage) {
            successMessage.classList.remove('show');
        }
        
        // Get form values
        const email = emailInput.value.trim();
        
        // Validate email
        if (!email) {
            showError('Vui lòng nhập địa chỉ email');
            return false;
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Vui lòng nhập địa chỉ email hợp lệ');
            return false;
        }
        
        // Show loading indicator
        showLoading();
        
        try {
            // Gửi yêu cầu đặt lại mật khẩu
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:5500/auth/update-password.html'
            });
            
            if (error) {
                throw error;
            }
            
            // Show success message
            if (successMessage) {
                successMessage.classList.add('show');
            }
            form.reset();
            
            // Prevent form from submitting
            return false;
            
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Đã xảy ra lỗi khi gửi email đặt lại mật khẩu. Vui lòng thử lại sau.';
            
            if (error.message) {
                if (error.message.includes('not found') || error.message.includes('not exist')) {
                    errorMessage = 'Không tìm thấy tài khoản với email này.';
                } else if (error.message.includes('rate limit')) {
                    errorMessage = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            showError(errorMessage);
            return false;
        } finally {
            // Hide loading indicator
            hideLoading();
        }
        
        return false;
    });
    
    // Add click handler for the back button
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'auth-sign-in.html';
        });
    }
});
