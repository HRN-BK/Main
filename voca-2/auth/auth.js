import { signIn, signUp, resetPassword, signOut } from '../js/auth.js';

const isAuthenticated = () => localStorage.getItem('isLoggedIn') === 'true';

const redirectIfAuthenticated = () => {
    if (isAuthenticated()) {
        window.location.href = '../main/index.html';
    }
};

const handleLogin = async (email, password) => {
    const { success, error } = await signIn(email, password);
    if (success) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = '../main/index.html';
    } else {
        throw new Error(error);
    }
};

const handleSignup = async (name, email, password) => {
    const { success, error } = await signUp(email, password, { fullName: name });
    if (success) {
        window.location.href = 'auth-sign-in.html';
    } else {
        throw new Error(error);
    }
};

const handlePasswordReset = async (email) => {
    const { success, error } = await resetPassword(email);
    if (!success) throw new Error(error);
};

const logout = async () => {
    await signOut();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'auth-sign-in.html';
};

window.auth = {
    isAuthenticated,
    redirectIfAuthenticated,
    handleLogin,
    handleSignup,
    handlePasswordReset,
    logout
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('auth-')) {
        redirectIfAuthenticated();
    }
});
