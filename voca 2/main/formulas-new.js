// Biến toàn cục
let currentUser = null;

// Sử dụng biến supabaseClient từ window
const { supabaseClient } = window;

// Hàm khởi tạo ứng dụng
window.initApp = async function(user) {
    try {
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
        console.error('Lỗi khởi tạo ứng dụng:', error);
        showNotification('Có lỗi xảy ra khi khởi tạo ứng dụng', 'error');
    }
};

// Hàm hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hàm tải danh sách công thức
async function loadFormulas() {
    try {
        // Đảm bảo supabaseClient đã được khởi tạo
        if (!window.supabaseClient) {
            console.error('Supabase client chưa được khởi tạo');
            return;
        }

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
        showNotification('Có lỗi xảy ra khi tải công thức', 'error');
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
    }
}

// Hàm hiển thị danh sách công thức
function renderFormulas(formulas) {
    const container = document.getElementById('formula-list');
    if (!container) return;
    
    if (formulas.length === 0) {
        container.innerHTML = '<p>Chưa có công thức nào. Hãy thêm công thức mới!</p>';
        return;
    }
    
    container.innerHTML = formulas.map(formula => `
        <div class="formula-card" data-id="${formula.id}">
            <h3>${formula.name}</h3>
            <div class="formula-content">${formula.content}</div>
            <div class="formula-actions">
                <button class="edit-btn" data-id="${formula.id}">Sửa</button>
                <button class="delete-btn" data-id="${formula.id}">Xóa</button>
            </div>
        </div>
    `).join('');
    
    // Render lại công thức toán học
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(container, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\(', right: '\\)', display: false}
            ]
        });
    }
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
                    const { error } = await supabaseClient
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
    
    const form = e.target;
    const formData = new FormData(form);
    const formulaData = {
        name: formData.get('name'),
        content: formData.get('content'),
        subject: formData.get('subject'),
        description: formData.get('description'),
        user_id: currentUser.id
    };
    
    try {
        const { error } = await supabaseClient
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

// Các hàm khác vẫn giữ nguyên
