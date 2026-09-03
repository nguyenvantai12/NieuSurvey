# VKU Field Survey - Basic Web App

Đây là phiên bản Web App cơ bản cho hệ thống khảo sát cơ sở vật chất khuôn viên trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU). 
Project này được xây dựng hoàn toàn bằng **HTML5, CSS3, và Vanilla JavaScript** nhằm tạo nền tảng vững chắc trước khi tiến hành chuyển đổi thành Progressive Web App (PWA).

## 🚀 Cấu trúc dự án

- `index.html`: Chứa cấu trúc giao diện chính của ứng dụng.
- `style.css`: File định dạng, xử lý màu sắc, layout, responsive (sử dụng CSS Variables và Grid/Flexbox).
- `main.js`: Chứa các logic tương tác như lắng nghe sự kiện form, kiểm tra dữ liệu, thêm/xóa khảo sát và lưu trữ trạng thái ở mảng.

## 🛠️ Hướng dẫn chạy dự án bằng VS Code Live Server

1. **Mở dự án trên VS Code**: Mở thư mục chứa dự án `vku-field-survey`.
2. **Cài đặt Live Server**: Vào phần Extensions (hoặc phím tắt `Ctrl + Shift + X`), tìm kiếm và cài đặt extension có tên "Live Server" của tác giả Ritwick Dey.
3. **Khởi chạy**: Mở file `index.html`, click chuột phải vào giao diện code, và chọn **"Open with Live Server"**.
4. Trình duyệt mặc định sẽ tự động mở và chạy web app trên một cổng local (VD: `http://127.0.0.1:5500/index.html`).

## 📱 Tính năng

- **Giao diện hiện đại, tối giản**: Dễ sử dụng, phù hợp với đối tượng sinh viên.
- **Form thêm khảo sát**: Gồm các thông tin như Họ tên, Khu vực, Hạng mục, Đánh giá, và Nhận xét.
- **Validation**: Đảm bảo tất cả các trường dữ liệu đều được nhập.
- **Quản lý danh sách**: Cho phép xem và xóa các bản ghi vừa tạo.
- **Responsive Web Design**: Tự động điều chỉnh layout trên cả Desktop, Tablet và Mobile.
- **Lưu trữ tĩnh (bộ nhớ tạm)**: Ở phiên bản này chưa có IndexedDB hay Backend, dữ liệu sẽ mất khi f5 (đây là tiền đề cho IndexedDB ở bài lab PWA sau).

## ⏭️ Bước tiếp theo

Hiện tại đây mới là **Web App cơ bản**. Để biến nó thành một ứng dụng PWA hoàn chỉnh, chúng ta cần:
**Web App → Web App Manifest → Service Worker → Cache → IndexedDB → Background Sync → VKU Field Survey PWA**
