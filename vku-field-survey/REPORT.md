# VKU FIELD SURVEY - WEEK 4 MINI PROJECT

## 1. Tổng quan

VKU Field Survey là ứng dụng khảo sát cơ sở vật chất trường VKU, xây dựng bằng HTML5, CSS3, Vanilla JavaScript, PWA và Capacitor Android.

## 2. Mục tiêu

Kết hợp PWA offline-first với Capacitor WebView và Native Bridge để lưu khảo sát, chụp ảnh, lấy vị trí, theo dõi mạng và thông báo cục bộ.

## 3. Kiến trúc hệ thống

```text
Web UI -> IndexedDB -> pendingSurveys -> Mock API
    |          |
    |          +-> Service Worker Cache/Background Sync
    +-> Capacitor Bridge -> Camera / GPS / Network / Notifications
```

## 4. Thành phần đã triển khai

- PWA Manifest, icon, Cache-first Service Worker và offline app shell.
- IndexedDB với `surveys` và `pendingSurveys`.
- `syncStatus`: `pending`, `synced`, `failed`.
- Camera native với preview ảnh hiện trường.
- Geolocation native lưu latitude/longitude theo survey.
- Network status Online/Offline và đồng bộ khi kết nối lại.
- Local Notification sau khi lưu survey nếu người dùng cấp quyền.
- Android project Capacitor với AGP 8.9.1 và plugin Capacitor 8.
- Render dữ liệu bằng DOM API, không chèn dữ liệu người dùng trực tiếp vào `innerHTML`.

## 5. Kiểm thử và bằng chứng

- Build web: `npm.cmd --prefix vku-field-survey run build`.
- Capacitor sync: chạy CLI trong thư mục `vku-field-survey`.
- Android debug APK: `android/gradlew.bat assembleDebug`.
- Ảnh minh chứng cần bổ sung: PWA browser, IndexedDB queue, Camera, Geolocation, Network, Notification, Android Emulator và APK.

## 6. Hạn chế

Backend hiện tại là JSONPlaceholder để mô phỏng POST, chưa lưu dữ liệu thật trên server. Ảnh được lưu dạng data URL trong IndexedDB. Chưa có automated test đầy đủ, authentication production hoặc signing key cho release APK.

## 7. Hướng phát triển

Thay mock API bằng backend thật, lưu ảnh vào object storage, thêm retry policy và viết test tự động cho IndexedDB, queue, permission và native plugin flows.
