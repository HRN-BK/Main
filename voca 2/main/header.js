// Check authentication status immediately when script loads
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const username = localStorage.getItem('username') || 'Người dùng';

// Path to auth directory (relative to the current page)
const getAuthPath = (path) => {
    const currentDir = window.location.pathname.split('/').slice(0, -1).join('/');
    return currentDir.includes('main') ? `../auth/${path}` : `auth/${path}`;
};

// Function to load header content
function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    const currentPath = window.location.pathname;
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    // Determine which auth UI to show based on the current state
    let authUI = '';
    
    if (isLoggedIn) {
        // Show user dropdown when logged in
        authUI = `
            <div id="userDropdown" class="user-dropdown">
                <button class="btn btn-user">
                    <i class="fas fa-user-circle"></i>
                    <span id="username">${username}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                    <a href="#" class="dropdown-item"><i class="fas fa-user"></i> Hồ sơ</a>
                    <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> Cài đặt</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" id="logoutBtn" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                </div>
            </div>`;
    } else {
        // Show login button when not logged in
        authUI = `
            <a href="${getAuthPath('auth-sign-in.html')}" id="loginBtn" class="btn btn-login">
                <i class="fas fa-sign-in-alt"></i> Đăng nhập
            </a>`;
    }

    const headerHTML = `
        <header class="header">
            <div class="header-container">
                <a href="index.html" class="logo">
                    <i class="fas fa-book-open"></i>
                    <span>Study Notes</span>
                </a>
                
                <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                    <i class="fas fa-bars"></i>
                </button>
                
                <nav class="nav-menu" id="navMenu">
                    <a href="index.html" class="nav-link ${currentPage === 'index.html' ? 'active' : ''}">
                        <i class="fas fa-home"></i> Trang chủ
                    </a>
                    <a href="vocabulary.html" class="nav-link ${currentPage === 'vocabulary.html' ? 'active' : ''}">
                        <i class="fas fa-book"></i> Từ vựng
                    </a>
                    <a href="formulas.html" class="nav-link ${currentPage === 'formulas.html' ? 'active' : ''}">
                        <i class="fas fa-superscript"></i> Công thức
                    </a>
                    <a href="symbols.html" class="nav-link ${currentPage === 'symbols.html' ? 'active' : ''}">
                        <i class="fas fa-icons"></i> Ký hiệu
                    </a>
                    <div class="auth-buttons">
                        ${authUI}
                    </div>
                </nav>
            </div>
        </header>
    `;

    headerPlaceholder.innerHTML = headerHTML;

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Function to update the UI after login/logout
function updateAuthUI() {
    // Reload the header to reflect the new auth state
    loadHeader();
    // Reattach event listeners
    attachEventListeners();
}

// Function to attach event listeners
function attachEventListeners() {
        // Handle login button click (for any dynamically added login buttons)
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            // If already logged in, prevent navigation and update UI
            if (isLoggedIn) {
                e.preventDefault();
                updateAuthUI();
            }
            // Otherwise, let the link navigate to the login page
        });
    }

    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            
            // Redirect to home page after logout if not already there
            if (!window.location.pathname.endsWith('index.html')) {
                window.location.href = 'index.html';
            } else {
                // Force a full page reload to ensure clean state
                window.location.reload();
            }
        });
    }
    
    // Toggle mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    if (mobileMenuBtn && navMenu) {
        // Remove any existing event listeners to prevent duplicates
        mobileMenuBtn.replaceWith(mobileMenuBtn.cloneNode(true));
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Toggle user dropdown
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu && !e.target.closest('.user-dropdown')) {
                menu.style.display = 'none';
            }
        }
    });
}

// Handle scroll effect on header
function handleScroll() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

// Initialize the header when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load the header with the correct auth state
    loadHeader();
    // Attach all event listeners
    attachEventListeners();
    
    // Set up scroll handler
    window.addEventListener('scroll', handleScroll);
    // Initialize scroll state
    handleScroll();
});
