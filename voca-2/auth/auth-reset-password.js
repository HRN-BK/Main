import { supabase } from '../js/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    const emailInput = document.getElementById('email');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorElement = document.getElementById('emailError');
    const successMessage = document.getElementById('successMessage');

    function showError(message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    function hideError() {
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    function showLoading() {
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }
    function hideLoading() {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        if (successMessage) successMessage.classList.remove('show');

        const email = emailInput.value.trim();
        if (!email) {
            showError('Vui lòng nhập địa chỉ email');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Vui lòng nhập địa chỉ email hợp lệ');
            return;
        }

        showLoading();
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/auth/update-password.html'
            });
            if (error) throw error;
            if (successMessage) successMessage.classList.add('show');
            form.reset();
        } catch (err) {
            console.error('Password reset error:', err);
            let msg = 'Đã xảy ra lỗi khi gửi email đặt lại mật khẩu. Vui lòng thử lại sau.';
            if (err.message) {
                if (err.message.includes('not found')) {
                    msg = 'Không tìm thấy tài khoản với email này.';
                } else {
                    msg = err.message;
                }
            }
            showError(msg);
        } finally {
            hideLoading();
        }
    });
});
