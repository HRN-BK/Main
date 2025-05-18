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

// Hàm thêm sự kiện
function setupEventListeners() {
    // Sự kiện mở modal thêm công thức
    const addFormulaBtn = document.getElementById('add-formula-btn');
    if (addFormulaBtn) {
        addFormulaBtn.addEventListener('click', () => {
            document.getElementById('formula-modal').style.display = 'block';
        });
    }
    
    // Sự kiện đóng modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('formula-modal').style.display = 'none';
        });
    }
    
    // Sự kiện submit form
    const formulaForm = document.getElementById('formula-form');
    if (formulaForm) {
        formulaForm.addEventListener('submit', handleSubmitFormula);
    }
    
    // Sự kiện xóa công thức
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa công thức này?')) {
                try {
                    const { error } = await supabase
                        .from('formulas')
                        .delete()
                        .eq('id', id)
                        .eq('user_id', currentUser.id);
                        
                    if (error) throw error;
                    
                    showNotification('Đã xóa công thức', 'success');
                    await loadFormulas();
                } catch (error) {
                    console.error('Lỗi xóa công thức:', error);
                    showNotification('Không thể xóa công thức', 'error');
                }
            }
        }
    });
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
    
    try {
        const { error } = await supabase
            .from('formulas')
            .upsert([formulaData]);
            
        if (error) throw error;
        
        showNotification('Lưu công thức thành công!', 'success');
        form.reset();
        document.getElementById('formula-modal').style.display = 'none';
        await loadFormulas();
    } catch (error) {
        console.error('Lỗi lưu công thức:', error);
        showNotification('Không thể lưu công thức', 'error');
    }
}

// Hàm khởi tạo ứng dụng
async function initApp() {
    try {
        // Kiểm tra đăng nhập
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            window.location.href = '../auth/auth-sign-in.html';
            return;
        }
        
        currentUser = user;
        console.log('User:', user);
        
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

// Khởi tạo Supabase sau khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Supabase client
    const SUPABASE_URL = 'https://tkiqqpqplbgrebcbsiop.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRraXFxcHFwbGJncmViY2JzaW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzM3MzYsImV4cCI6MjA2MzA0OTczNn0.FJ0C0d4PYJTTUSL55tDroIpz5jcW9gvYX9eSKoB3Iz4';
    
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Khởi tạo ứng dụng
    initApp();
});
        
        currentUser = user;
        console.log('User:', user);
        
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
});

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
    closeButtons.forEach((btn) => {
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
    
    // Xem trước công thức LaTeX
    const formulaInput = document.getElementById('formulaInput');
    if (formulaInput) {
        formulaInput.addEventListener('input', updateFormulaPreview);
    }
    
    // Đóng modal khi click nút đóng
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeFormulaModal);
    }
}

// Tải danh sách công thức
async function loadFormulas() {
    try {
        const { data: formulas, error } = await supabase
            .from('formulas')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        renderFormulas(formulas || []);
    } catch (error) {
        console.error('Lỗi tải công thức:', error);
        showNotification('Không thể tải danh sách công thức', 'error');
    }
}

// Hiển thị danh sách công thức
function renderFormulas(formulas) {
    const formulaList = document.querySelector('.formula-list');
    if (!formulaList) return;
    
    if (formulas.length === 0) {
        formulaList.innerHTML = `
            <div class="no-formulas">
                <i class="fas fa-clipboard-list"></i>
                <p>Chưa có công thức nào. Hãy thêm công thức mới!</p>
            </div>
        `;
        return;
    }
    
    formulaList.innerHTML = formulas.map(formula => createFormulaCard(formula)).join('');
    
    // Thêm sự kiện cho các nút xóa/sửa
    document.querySelectorAll('.delete-formula').forEach(btn => {
        btn.addEventListener('click', handleDeleteFormula);
    });
    
    document.querySelectorAll('.edit-formula').forEach(btn => {
        btn.addEventListener('click', handleEditFormula);
    });
    
    // Render lại công thức toán học
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(formulaList, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ]
        });
    }
}

// Tạo thẻ công thức
function createFormulaCard(formula) {
    const subjectClass = getSubjectClass(formula.subject);
    const subjectName = getSubjectName(formula.subject);
    
    return `
        <div class="formula-card" data-id="${formula.id}">
            <div class="formula-content">
                <h3>${escapeHtml(formula.title)}</h3>
                <div class="formula-display">
                    ${formula.formula}
                </div>
                <div class="formula-desc">
                    <p>${escapeHtml(formula.description || '')}</p>
                </div>
            </div>
            <div class="formula-actions">
                <span class="subject-badge ${subjectClass}">${subjectName}</span>
                <div class="action-buttons">
                    <button class="btn-icon edit-formula" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-formula" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Xử lý lưu công thức
async function handleSaveFormula(e) {
    e.preventDefault();
    
    const form = e.target;
    const id = form.dataset.id;
    const title = form.formulaTitle.value.trim();
    const formula = form.formulaInput.value.trim();
    const description = form.formulaDesc.value.trim();
    const subject = form.formulaSubject.value;
    
    if (!title || !formula || !subject) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    try {
        const formulaData = {
            title,
            formula,
            description,
            subject,
            user_id: currentUser.id
        };
        
        if (id) {
            // Cập nhật công thức
            const { error } = await supabase
                .from('formulas')
                .update(formulaData)
                .eq('id', id)
                .eq('user_id', currentUser.id);
            
            if (error) throw error;
            showNotification('Cập nhật công thức thành công', 'success');
        } else {
            // Thêm công thức mới
            const { error } = await supabase
                .from('formulas')
                .insert([formulaData]);
            
            if (error) throw error;
            showNotification('Thêm công thức thành công', 'success');
        }
        
        // Đóng modal và tải lại danh sách
        closeFormulaModal();
        await loadFormulas();
        
    } catch (error) {
        console.error('Lỗi lưu công thức:', error);
        showNotification('Có lỗi xảy ra khi lưu công thức', 'error');
    }
}

// Xử lý xóa công thức
async function handleDeleteFormula(e) {
    if (!confirm('Bạn có chắc chắn muốn xóa công thức này?')) {
        return;
    }
    
    const card = e.target.closest('.formula-card');
    const id = card.dataset.id;
    
    try {
        const { error } = await supabase
            .from('formulas')
            .delete()
            .eq('id', id)
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        card.remove();
        showNotification('Đã xóa công thức', 'success');
        
        // Nếu không còn công thức nào, hiển thị thông báo
        if (!document.querySelector('.formula-card')) {
            loadFormulas();
        }
    } catch (error) {
        console.error('Lỗi xóa công thức:', error);
        showNotification('Có lỗi xảy ra khi xóa công thức', 'error');
    }
}

// Xử lý chỉnh sửa công thức
function handleEditFormula(e) {
    const card = e.target.closest('.formula-card');
    const id = card.dataset.id;
    
    // Lấy dữ liệu từ thẻ
    const title = card.querySelector('h3').textContent;
    const formula = card.querySelector('.formula-display').innerHTML;
    const description = card.querySelector('.formula-desc p').textContent;
    const subject = card.querySelector('.subject-badge').classList[1] === 'math' ? 'toan' : 
                   card.querySelector('.subject-badge').classList[1] === 'physics' ? 'ly' : 
                   card.querySelector('.subject-badge').classList[1] === 'chemistry' ? 'hoa' : 'sinh';
    
    // Điền dữ liệu vào form
    const form = document.getElementById('formulaForm');
    form.dataset.id = id;
    form.formulaTitle.value = title;
    form.formulaInput.value = formula;
    form.formulaDesc.value = description;
    form.formulaSubject.value = subject;
    
    // Mở modal
    openFormulaModal();
    
    // Cập nhật preview
    updateFormulaPreview();
}

// Cập nhật xem trước công thức
function updateFormulaPreview() {
    const formulaInput = document.getElementById('formulaInput');
    const preview = document.getElementById('formulaPreview');
    
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
    const modal = document.getElementById('formulaModal');
    if (!modal) return;
    
    // Reset form nếu là thêm mới
    if (!modal.querySelector('#formulaForm').dataset.id) {
        modal.querySelector('#formulaForm').reset();
        modal.querySelector('#formulaForm').removeAttribute('data-id');
        document.getElementById('modalTitle').textContent = 'Thêm công thức mới';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus vào ô tiêu đề
    setTimeout(() => {
        const titleInput = document.getElementById('formulaTitle');
        if (titleInput) titleInput.focus();
    }, 100);
}

// Đóng modal
function closeFormulaModal() {
    const modal = document.getElementById('formulaModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset form
    const form = document.getElementById('formulaForm');
    if (form) {
        form.reset();
        form.removeAttribute('data-id');
    }
    
    // Xóa preview
    const preview = document.getElementById('formulaPreview');
    if (preview) preview.innerHTML = '';
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 10);
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
        'toan': 'math',
        'ly': 'physics',
        'hoa': 'chemistry',
        'sinh': 'biology'
    };
    return classes[subject] || '';
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

// Thêm sự kiện toàn cục để đóng modal
window.closeFormulaModal = closeFormulaModal;