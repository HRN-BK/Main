// Biến toàn cục
let currentUser = null;

// Hàm hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.notification-container');
    if (container) {
        container.appendChild(notification);
    } else {
        document.body.insertAdjacentElement('afterbegin', notification);
    }
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(notification);
        bsAlert.close();
    }, 3000);
}

// Hàm tải danh sách công thức
async function loadFormulas() {
    try {
        const { data, error } = await window.supabaseClient
            .from('formulas')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        renderFormulas(data || []);
        
        // Nếu không có dữ liệu, thêm dữ liệu mẫu
        if (!data || data.length === 0) {
            await addSampleFormulas();
        }
    } catch (error) {
        console.error('Lỗi tải công thức:', error);
        showNotification('Không thể tải danh sách công thức', 'error');
    }
}

// Hàm thêm dữ liệu mẫu
async function addSampleFormulas() {
    try {
        const sampleFormulas = [
            {
                name: 'Định lý Pythagoras',
                subject: 'toan',
                content: 'a^2 + b^2 = c^2',
                description: 'Định lý Pythagoras trong tam giác vuông',
                created_at: new Date().toISOString()
            },
            {
                name: 'Định luật II Newton',
                subject: 'ly',
                content: 'F = m \\cdot a',
                description: 'Lực bằng khối lượng nhân với gia tốc',
                created_at: new Date().toISOString()
            },
            {
                name: 'Phương trình hóa học nước',
                subject: 'hoa',
                content: '2H_2 + O_2 \\rightarrow 2H_2O',
                description: 'Phản ứng hóa học tạo thành nước',
                created_at: new Date().toISOString()
            }
        ];

        const { data, error } = await window.supabaseClient
            .from('formulas')
            .insert(sampleFormulas)
            .select();

        if (error) throw error;

        // Hiển thị lại danh sách sau khi thêm mẫu
        loadFormulas();
        showNotification('Đã thêm dữ liệu mẫu thành công', 'success');
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu mẫu:', error);
        showNotification('Có lỗi khi thêm dữ liệu mẫu', 'error');
    }
}

// Hàm hiển thị danh sách công thức
function renderFormulas(formulas) {
    const container = document.getElementById('formula-list');
    if (!container) return;
    
    if (formulas.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted">Chưa có công thức nào. Hãy thêm công thức mới!</p>
                <button class="btn btn-primary" id="add-first-formula">
                    <i class="fas fa-plus me-2"></i>Thêm công thức đầu tiên
                </button>
            </div>`;
        
        // Thêm sự kiện cho nút thêm mới
        const addBtn = document.getElementById('add-first-formula');
        if (addBtn) {
            addBtn.addEventListener('click', openFormulaModal);
        }
        return;
    }
    
    container.innerHTML = `
        <div class="row row-cols-1 row-cols-md-2 g-4">
            ${formulas.map(formula => `
                <div class="col">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">${escapeHtml(formula.name)}</h5>
                            <span class="badge ${getSubjectClass(formula.subject)}">
                                ${getSubjectName(formula.subject)}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="formula-content mb-3">${formula.content}</div>
                            ${formula.description ? `<p class="card-text">${escapeHtml(formula.description)}</p>` : ''}
                        </div>
                        <div class="card-footer bg-transparent">
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">
                                    ${new Date(formula.created_at).toLocaleDateString('vi-VN')}
                                </small>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary edit-formula" data-id="${formula.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-formula" data-id="${formula.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    
    // Render lại công thức toán học
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(container, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\(', right: '\\)', display: false}
            ]
        });
    }
    
    // Thêm sự kiện cho các nút xóa và sửa
    document.querySelectorAll('.delete-formula').forEach(btn => {
        btn.addEventListener('click', handleDeleteFormula);
    });
    
    document.querySelectorAll('.edit-formula').forEach(btn => {
        btn.addEventListener('click', handleEditFormula);
    });
}

// Hàm xử lý xóa công thức
async function handleDeleteFormula(e) {
    const id = e.currentTarget.dataset.id;
    if (!id || !confirm('Bạn có chắc chắn muốn xóa công thức này?')) return;
    
    try {
        const { error } = await window.supabaseClient
            .from('formulas')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        showNotification('Đã xóa công thức thành công', 'success');
        await loadFormulas();
    } catch (error) {
        console.error('Lỗi khi xóa công thức:', error);
        showNotification('Có lỗi xảy ra khi xóa công thức', 'error');
    }
}

// Hàm xử lý sửa công thức
function handleEditFormula(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    
    // Lấy dữ liệu công thức từ danh sách hiện tại
    const formula = Array.from(document.querySelectorAll('.formula-card')).find(
        card => card.dataset.id === id
    );
    
    if (!formula) return;
    
    // Điền dữ liệu vào form
    const form = document.getElementById('formula-form');
    if (!form) return;
    
    form.dataset.id = id;
    form.querySelector('#formula-name').value = formula.dataset.name || '';
    form.querySelector('#formula-subject').value = formula.dataset.subject || '';
    form.querySelector('#formula-content').value = formula.dataset.content || '';
    form.querySelector('#formula-desc').value = formula.dataset.description || '';
    
    // Mở modal
    openFormulaModal();
}

// Hàm xử lý submit form
async function handleSubmitFormula(e) {
    e.preventDefault();
    
    try {
        const form = e.target;
        const formData = new FormData(form);
        const formulaId = formData.get('formula-id');
        const formulaData = {
            name: formData.get('name'),
            content: formData.get('content'),
            subject: formData.get('subject'),
            description: formData.get('description'),
            updated_at: new Date().toISOString()
        };
        
        let error = null;
        
        if (formulaId) {
            // Cập nhật công thức
            const { error: updateError } = await window.supabaseClient
                .from('formulas')
                .update(formulaData)
                .eq('id', formulaId);
            error = updateError;
        } else {
            // Thêm mới công thức
            const { error: insertError } = await window.supabaseClient
                .from('formulas')
                .insert([{ ...formulaData, user_id: currentUser.id }]);
            error = insertError;
        }
        
        if (error) throw error;
        
        // Đóng modal và làm mới danh sách
        closeFormulaModal();
        await loadFormulas();
        showNotification(`Đã ${formulaId ? 'cập nhật' : 'thêm mới'} công thức thành công`, 'success');
    } catch (error) {
        console.error('Lỗi khi lưu công thức:', error);
        showNotification('Có lỗi xảy ra khi lưu công thức', 'error');
    }
}

// Hàm cập nhật xem trước công thức
function updateFormulaPreview() {
    const formulaInput = document.getElementById('formula-content');
    const preview = document.getElementById('formula-preview');
    
    if (!formulaInput || !preview) return;
    
    try {
        preview.innerHTML = formulaInput.value;
        
        // Render lại công thức toán học
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(preview, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    } catch (e) {
        console.error('Lỗi render công thức:', e);
    }
}

// Mở modal thêm/sửa công thức
function openFormulaModal() {
    const modal = document.getElementById('formula-modal');
    if (!modal) return;
    
    // Reset form nếu là thêm mới
    if (!modal.querySelector('#formula-form').dataset.id) {
        modal.querySelector('#formula-form').reset();
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus vào trường tên
    const nameInput = modal.querySelector('#formula-name');
    if (nameInput) nameInput.focus();
    
    // Cập nhật preview
    updateFormulaPreview();
}

// Đóng modal
function closeFormulaModal() {
    const modal = document.getElementById('formula-modal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset form
    const form = document.getElementById('formula-form');
    if (form) {
        form.reset();
        form.removeAttribute('data-id');
    }
    
    // Xóa preview
    const preview = document.getElementById('formula-preview');
    if (preview) preview.innerHTML = '';
}

// Lấy tên hiển thị của môn học
function getSubjectName(subject) {
    const subjects = {
        'toan': 'Toán học',
        'ly': 'Vật lý',
        'hoa': 'Hóa học',
        'sinh': 'Sinh học'
    };
    return subjects[subject] || subject;
}

// Lấy class CSS cho môn học
function getSubjectClass(subject) {
    const classes = {
        'toan': 'bg-primary',
        'ly': 'bg-success',
        'hoa': 'bg-danger',
        'sinh': 'bg-info'
    };
    return classes[subject] || 'bg-secondary';
}

// Escape HTML để tránh XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Khởi tạo ứng dụng
async function initApp() {
    try {
        // Kiểm tra đăng nhập
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (error || !user) {
            window.location.href = '../auth/auth-sign-in.html';
            return;
        }
        
        currentUser = user;
        
        // Tải danh sách công thức
        await loadFormulas();
        
        // Thêm sự kiện
        setupEventListeners();
        
        // Hiển thị thông báo nếu có tham số success trong URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            showNotification('Đăng nhập thành công!', 'success');
            // Xóa tham số success khỏi URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (error) {
        console.error('Lỗi khởi tạo:', error);
        showNotification('Có lỗi xảy ra khi khởi tạo ứng dụng', 'error');
    }
}

// Cài đặt các sự kiện
function setupEventListeners() {
    // Nút thêm công thức
    const addBtn = document.getElementById('add-formula-btn');
    if (addBtn) {
        addBtn.addEventListener('click', openFormulaModal);
    }
    
    // Form lưu công thức
    const formulaForm = document.getElementById('formula-form');
    if (formulaForm) {
        formulaForm.addEventListener('submit', handleSubmitFormula);
    }
    
    // Nút đóng modal
    const closeButtons = document.querySelectorAll('.close-modal, .btn-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeFormulaModal);
    });
    
    // Đóng modal khi click ra ngoài
    const modal = document.getElementById('formula-modal');
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeFormulaModal();
            }
        });
    }
    
    // Đóng modal khi nhấn ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeFormulaModal();
        }
    });
    
    // Cập nhật preview khi thay đổi nội dung công thức
    const formulaContent = document.getElementById('formula-content');
    if (formulaContent) {
        formulaContent.addEventListener('input', updateFormulaPreview);
    }
}

// Khởi động ứng dụng khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Supabase client nếu chưa có
    if (!window.supabaseClient) {
        const SUPABASE_URL = 'https://tkiqqpqplbgrebcbsiop.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRraXFxcHFwbGJncmViY2JzaW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzM3MzYsImV4cCI6MjA2MzA0OTczNn0.FJ0C0d4PYJTTUSL55tDroIpz5jcW9gvYX9eSKoB3Iz4';
        
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    
    // Khởi tạo ứng dụng
    initApp();
});

// Thêm sự kiện toàn cục để đóng modal
window.closeFormulaModal = closeFormulaModal;
