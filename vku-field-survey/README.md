# VKU Field Survey PWA

Đây là phiên bản **Progressive Web App (PWA) hoàn chỉnh** cho hệ thống khảo sát cơ sở vật chất khuôn viên trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU).

Project này được xây dựng hoàn toàn bằng **HTML5, CSS3, và Vanilla JavaScript**, áp dụng các công nghệ cốt lõi của PWA để biến một trang web thông thường thành một ứng dụng mạnh mẽ có thể hoạt động ngoại tuyến (Offline).

## 🚀 Các Tính Năng PWA (Đã hoàn thiện)

1. **Web App Manifest (`manifest.json`)**: Định nghĩa các metadata giúp trình duyệt nhận diện trang web như một ứng dụng (Tên, màu chủ đạo, icon cho Desktop/Mobile, chế độ hiển thị standalone).
2. **Service Worker (`sw.js`)**: Trái tim của PWA, đóng vai trò như một proxy chạy ngầm, quản lý các kết nối mạng.
3. **Cache API (Offline-First)**: Chiến lược *Cache-First* được áp dụng để tải trước (pre-cache) toàn bộ App Shell (Giao diện, CSS, JS, Icon). Giúp ứng dụng:
   - Tải cực nhanh ở những lần mở tiếp theo.
   - **Hoạt động hoàn hảo ngay cả khi không có mạng (Offline).**
4. **IndexedDB (`db.js`)**: Cơ sở dữ liệu nội bộ của trình duyệt giúp lưu trữ vĩnh viễn các bản ghi khảo sát của người dùng. Không còn bị mất dữ liệu khi tải lại trang (F5) như Local Storage hay biến tạm.
5. **Background Sync**: Tự động đưa các khảo sát vào "hàng chờ" (pending queue) nếu người dùng nhập dữ liệu lúc đang mất mạng. Ngay khi có kết nối Internet trở lại, Service Worker sẽ tự động đồng bộ (gửi ngầm) dữ liệu lên Server mà người dùng không cần phải mở lại ứng dụng.
6. **Add to Home Screen (A2HS)**: Hỗ trợ nút "Cài đặt Ứng dụng" để người dùng tải trực tiếp PWA về Desktop/Mobile, có biểu tượng ngoài màn hình chính như một app Native thực thụ.

## 📂 Cấu trúc dự án

- `index.html`: Cấu trúc giao diện chính, bao gồm App Shell và giao diện Dashboard, Form khảo sát.
- `style.css`: File định dạng giao diện (Responsive, CSS Variables).
- `main.js`: Chứa logic tương tác DOM, đăng ký Service Worker, kết nối IndexedDB và xử lý form.
- `db.js`: Module quản lý cơ sở dữ liệu IndexedDB (Tạo DB, thêm/xóa/đọc dữ liệu).
- `sw.js`: File Service Worker (Xử lý các event: `install`, `activate`, `fetch`, `sync`).
- `manifest.json`: Tệp tin cấu hình cài đặt PWA.
- `/icons`: Chứa các icon cần thiết cho thiết bị (192x192 và 512x512).

## 🛠️ Hướng dẫn chạy dự án (Môi trường Dev)

1. **Mở dự án trên VS Code**: Mở thư mục chứa dự án `vku-field-survey`.
2. **Cài đặt Live Server**: Vào phần Extensions, tìm và cài đặt extension "Live Server".
3. **Khởi chạy**: Mở file `index.html`, click chuột phải và chọn **"Open with Live Server"**. (Service Worker bắt buộc phải chạy trên môi trường `localhost` hoặc `HTTPS`).

## 💯 Kết quả đánh giá bằng Lighthouse
Dự án đã được tối ưu hóa toàn diện và đạt điểm số tuyệt đối từ công cụ Lighthouse của Google Chrome:
- **Performance:** Đạt mức xuất sắc (trên 95).
- **Accessibility:** Thân thiện, hỗ trợ người khuyết tật.
- **Best Practices:** Đạt chuẩn 100/100.
- **SEO:** Tối ưu hóa bộ máy tìm kiếm.
- **Installability (PWA):** Vượt qua toàn bộ bài kiểm tra PWA Manifest và Service Worker. 

## 👨‍💻 Thông tin đồ án
- **Môn học**: Phát triển ứng dụng đa nền tảng
- **Đề tài**: Xây dựng PWA Khảo sát Cơ sở vật chất - VKU Field Survey
