zz// Auth state management
const isAuthenticated = () => localStorage.getItem('isLoggedIn') === 'true';

// Redirect to home if already logged in
const redirectIfAuthenticated = () => {
    if (isAuthenticated()) {
        window.location.href = '../main/index.html';
    }
};

// Handle login form submission
const handleLogin = (email, password) => {
    // TODO: Implement actual authentication
    // For now, just simulate a successful login
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', email || 'Người dùng');
    
    // Redirect to the main page
    window.location.href = '../main/index.html';
};

// Handle signup form submission
const handleSignup = (name, email, password) => {
    // TODO: Implement actual signup
    // For now, just simulate a successful signup
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', name || 'Người dùng');
    
    // Redirect to the main page
    window.location.href = '../main/index.html';
};

// Handle password reset
const handlePasswordReset = (email) => {
    // TODO: Implement actual password reset
    alert(`Một liên kết đặt lại mật khẩu đã được gửi đến ${email}`);
    // Redirect to login page after showing the message
    setTimeout(() => {
        window.location.href = 'auth-sign-in.html';
    }, 2000);
};

// Logout function
const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'auth-sign-in.html';
};

// Export functions for use in other files
window.auth = {
    isAuthenticated,
    redirectIfAuthenticated,
    handleLogin,
    handleSignup,
    handlePasswordReset,
    logout
};

// Check auth state when auth.js is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only run on auth pages
    if (window.location.pathname.includes('auth-')) {
        redirectIfAuthenticated();
    }
});
