import { onAuthStateChange } from './auth.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    checkAuthState();
    
    // Set up auth state change listener
    onAuthStateChange((event, session) => {        checkAuthState();
    });
    
    // Initialize other components
    initializeComponents();
});

// Check authentication state and update UI
function checkAuthState() {
    const user = supabase.auth.getUser();
    const header = document.getElementById('header-placeholder');
    
    if (!header) return;
    
    if (user) {
        // User is signed in
        header.innerHTML = `
            <header class="header">
                <div class="header-container">
                    <a href="index.html" class="logo">
                        <i class="fas fa-book-open"></i>
                        <span>Study Notes</span>
                    </a>
                    <nav class="main-nav">
                        <a href="#" class="nav-link active">Trang chủ</a>
                        <a href="notes.html" class="nav-link">Ghi chú</a>
                        <a href="folders.html" class="nav-link">Thư mục</a>
                        <a href="favorites.html" class="nav-link">Yêu thích</a>
                    </nav>
                    <div class="user-menu">
                        <button id="userMenuButton" class="user-button">
                            <i class="fas fa-user-circle"></i>
                            <span>${user.email || 'Tài khoản'}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-menu" id="userDropdown">
                            <a href="profile.html" class="dropdown-item">
                                <i class="fas fa-user"></i> Hồ sơ
                            </a>
                            <a href="settings.html" class="dropdown-item">
                                <i class="fas fa-cog"></i> Cài đặt
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" id="logoutButton" class="dropdown-item">
                                <i class="fas fa-sign-out-alt"></i> Đăng xuất
                            </a>
                        </div>
                    </div>
                </div>
            </header>
        `;
        
        // Add event listeners for the user menu
        setupUserMenu();
    } else {
        // User is not signed in
        header.innerHTML = `
            <header class="header">
                <div class="header-container">
                    <a href="index.html" class="logo">
                        <i class="fas fa-book-open"></i>
                        <span>Study Notes</span>
                    </a>
                    <nav class="main-nav">
                        <a href="#features" class="nav-link">Tính năng</a>
                        <a href="#pricing" class="nav-link">Giá cả</a>
                        <a href="#about" class="nav-link">Về chúng tôi</a>
                    </nav>
                    <div class="auth-buttons">
                        <a href="auth/auth-sign-in.html" class="btn btn-outline">Đăng nhập</a>
                        <a href="auth/auth-sign-up.html" class="btn btn-primary">Đăng ký</a>
                    </div>
                </div>
            </header>
        `;
    }
}

// Set up user menu functionality
function setupUserMenu() {
    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    const logoutButton = document.getElementById('logoutButton');
    
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Handle logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.');
            }
        });
    }
}

// Initialize other components
function initializeComponents() {
    // Add any additional component initializations here
}
