# Công thức Toán học - Vật lý - Hóa học

Tính năng quản lý công thức cho phép người dùng thêm, xem, sửa, xóa các công thức toán học, vật lý, hóa học.

## Các tính năng chính

- Thêm công thức mới với hỗ trợ LaTeX
- Xem danh sách công thức đã lưu
- Chỉnh sửa công thức
- Xóa công thức
- Tìm kiếm và lọc công thức theo môn học
- Xem trước công thức LaTeX ngay lập tức

## Cách sử dụng

1. **Thêm công thức mới**
   - Nhấn nút "Thêm công thức"
   - Điền thông tin công thức:
     - Tiêu đề
     - Chọn môn học
     - Nhập công thức (sử dụng cú pháp LaTeX)
     - Mô tả chi tiết (tùy chọn)
   - Nhấn "Lưu công thức"

2. **Chỉnh sửa công thức**
   - Nhấn biểu tượng chỉnh sửa (bút) trên thẻ công thức
   - Cập nhật thông tin cần thiết
   - Nhấn "Lưu công thức"

3. **Xóa công thức**
   - Nhấn biểu tượng thùng rác trên thẻ công thức
   - Xác nhận khi được hỏi

4. **Tìm kiếm và lọc**
   - Sử dụng ô tìm kiếm để tìm công thức theo từ khóa
   - Sử dụng dropdown lọc để xem công thức theo môn học

## Cú pháp LaTeX hỗ trợ

Công thức được hiển thị bằng thư viện KaTeX, hỗ trợ hầu hết các lệnh LaTeX thông dụng:

- `$...$` hoặc `\(...\)` cho công thức nội dòng
- `$$...$$` hoặc `\[...\]` cho công thức hiển thị riêng dòng
- Các lệnh toán học: `\frac{}{}`, `\sqrt{}`, `\sum`, `\int`, v.v.
- Ký hiệu Hy Lạp: `\alpha`, `\beta`, `\Omega`, v.v.
- Ký hiệu quan hệ: `\leq`, `\geq`, `\neq`, v.v.

## Thiết lập cơ sở dữ liệu

1. Tạo bảng `formulas` trong Supabase với cấu trúc sau:
   ```sql
   -- SQL migration file đã được tạo trong thư mục supabase/migrations/
   -- Chạy file này trong SQL Editor của Supabase
   ```

2. Kích hoạt Row Level Security (RLS) và tạo các policy cần thiết

## Tích hợp

Để sử dụng tính năng này, cần thêm các thư viện sau vào trang:

```html
<!-- KaTeX for formula rendering -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>

<!-- Supabase client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## Giấy phép

Dự án này sử dụng giấy phép MIT.
