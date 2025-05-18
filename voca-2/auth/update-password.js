import { supabase } from '../js/supabase.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('updatePasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const successMessage = document.getElementById('successMessage');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const passwordStrength = document.getElementById('passwordStrength');
    const authContent = document.querySelector('.auth-content');

    if (form) form.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';

    showLoading();

    // Check for error in URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const error = params.get('error');
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (error) {
        showTokenError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        hideLoading();
        return;
    }

    if (!accessToken || !refreshToken || type !== 'recovery') {
        showTokenError('Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu gửi lại email.');
        hideLoading();
        return;
    }

    try {
        const { error: authError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        if (authError) throw authError;
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
        console.error('Token validation error:', err);
        showTokenError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        return;
    }

    if (form) form.style.display = 'block';
    hideLoading();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password.length < 6) {
            passwordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
            return;
        }
        if (password !== confirmPassword) {
            confirmPasswordError.textContent = 'Mật khẩu xác nhận không khớp';
            return;
        }

        showLoading();
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            if (successMessage) successMessage.style.display = 'block';
            form.style.display = 'none';
        } catch (err) {
            console.error('Password update error:', err);
            passwordError.textContent = 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
        } finally {
            hideLoading();
        }
    });

    passwordInput.addEventListener('input', () => {
        const strength = passwordInput.value.length;
        if (passwordStrength) {
            passwordStrength.textContent = `Độ dài: ${strength}`;
        }
    });

    function showLoading() {
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }
    function hideLoading() {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
    function showTokenError(msg) {
        if (authContent) authContent.innerHTML = `<p class="error">${msg}</p>`;
    }
});
