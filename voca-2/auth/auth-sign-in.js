import { signIn } from '../js/auth.js';
import { supabase } from '../js/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signinForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');
    const googleLoginBtn = document.getElementById('googleLogin');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const errorElement = document.getElementById('error-message');

    // Check for saved credentials
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMe.checked = true;
    }

    // Google OAuth login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) {
                console.error('Google sign-in error:', error);
            }
        });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset errors
        errorElement.textContent = '';
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validation
        if (!email || !password) {
            showError('Vui lòng nhập email và mật khẩu');
            return;
        }
        
        // Save email if "Remember me" is checked
        if (rememberMe.checked) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }
        
        // Show loading state
        loadingOverlay.style.display = 'flex';
        
        try {
            // Sign in the user
            const { success, error } = await signIn(email, password);
            
            if (success) {
                // Redirect to the main page
                window.location.href = '../index.html';
            } else {
                throw new Error(error);
            }
        } catch (error) {
            console.error('Sign in error:', error);
            showError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });
    
    // Helper function to show error messages
    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
