// Hàm hiển thị thông báo lỗi
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.error('Lỗi:', message);
    } else {
        console.error('Error element not found:', message);
    }
}

// Hàm hiển thị thông báo thành công
function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'alert alert-success';
    successElement.textContent = message;
    
    const formHeader = document.querySelector('.form-header');
    if (formHeader) {
        formHeader.insertAdjacentElement('afterend', successElement);
        
        // Cuộn đến thông báo
        successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Xóa thông báo sau 5 giây
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    } else {
    }
}

// Hàm kiểm tra email hợp lệ
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    if (!form) {
        console.error('Không tìm thấy form đăng ký');
        return;
    }

    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const errorElement = document.getElementById('error-message');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Kiểm tra xem tất cả các phần tử cần thiết có tồn tại không
    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
        console.error('Không tìm thấy một hoặc nhiều trường nhập liệu cần thiết');
        return;
    }

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (!input) return;
            
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset errors
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Get form values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError('Vui lòng nhập địa chỉ email hợp lệ');
            return;
        }
        
        if (password.length < 6) {
            showError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp');
            return;
        }
        
        // Show loading state
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        try {
            
            // Kiểm tra xem supabase đã được định nghĩa chưa
            if (typeof supabase === 'undefined') {
                throw new Error('Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại sau.');
            }
            
            // Gọi hàm đăng ký của Supabase
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        email_redirect_to: window.location.origin + '/auth/auth-sign-in.html'
                    }
                }
            });
            
            if (error) {
                console.error('Lỗi từ Supabase:', error);
                throw error;
            }
            
            
            // Hiển thị thông báo thành công
            showSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            
            // Xóa form
            form.reset();
            
            // Chuyển hướng về trang đăng nhập sau 5 giây
            setTimeout(() => {
                window.location.href = 'auth-sign-in.html';
            }, 5000);
            
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            
            // Xử lý thông báo lỗi chi tiết hơn
            let errorMessage = 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.';
            
            if (error.message) {
                if (error.message.includes('already registered')) {
                    errorMessage = 'Email này đã được đăng ký. Vui lòng sử dụng email khác.';
                } else if (error.message.includes('password')) {
                    errorMessage = 'Mật khẩu không đủ mạnh. Vui lòng thử mật khẩu khác.';
                } else if (error.message.includes('email')) {
                    errorMessage = 'Địa chỉ email không hợp lệ.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            showError(errorMessage);
        } finally {
            // Ẩn loading
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    });
});
