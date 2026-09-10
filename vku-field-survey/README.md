# VKU FIELD SURVEY

Ứng dụng khảo sát cơ sở vật chất VKU, xây dựng bằng Vanilla JavaScript, PWA và Capacitor Android.

## 1. Tính năng

- Form khảo sát, IndexedDB và dashboard trạng thái đồng bộ.
- Offline-first với hàng đợi `pendingSurveys`.
- Cache-first Service Worker và Add to Home Screen.
- Camera native chụp ảnh hiện trường.
- Geolocation native lưu latitude/longitude.
- Network plugin hiển thị Online/Offline và kích hoạt đồng bộ khi online.
- Local Notifications báo khảo sát đã lưu trên Android.
- Xóa survey đồng thời xóa item tương ứng trong queue.

## 2. Kiến trúc

```text
HTML/CSS/JavaScript -> PWA -> Capacitor WebView -> Capacitor Bridge -> Android APIs
```

`capacitor.config.json` dùng `dist` làm `webDir`. `build.mjs` copy app shell vào `dist` trước khi Capacitor sync.

## 3. Offline-first và IndexedDB

Store `surveys` giữ dữ liệu hiển thị. Store `pendingSurveys` giữ bản sao chờ gửi. Mỗi survey có `syncStatus`: `pending`, `synced` hoặc `failed`. Dữ liệu cũ không có trạng thái vẫn được đọc và tự suy ra từ queue.

## 4. Native plugins

- `@capacitor/camera`: `Camera.getPhoto()` với preview và xóa ảnh.
- `@capacitor/geolocation`: lấy và lưu tọa độ hiện tại.
- `@capacitor/network`: theo dõi thay đổi kết nối.
- `@capacitor/local-notifications`: thông báo sau khi lưu; bị từ chối quyền vẫn không làm app lỗi.

Browser có fallback rõ ràng cho các tính năng native.

## 5. Cài đặt và build

```powershell
& 'D:\Nodejs\npm.cmd' --prefix vku-field-survey install
& 'D:\Nodejs\npm.cmd' --prefix vku-field-survey run build
Push-Location vku-field-survey
& 'D:\Nodejs\node.exe' node_modules\@capacitor\cli\bin\capacitor sync android
Pop-Location
```

Mở `vku-field-survey/android` bằng Android Studio để chạy emulator. Build APK debug:

```powershell
Push-Location vku-field-survey\android
.\gradlew.bat assembleDebug
Pop-Location
```

APK thường nằm tại `android/app/build/outputs/apk/debug/app-debug.apk`.

## 6. Giới hạn

API hiện tại là JSONPlaceholder để mô phỏng đồng bộ, chưa phải backend thật. Ảnh đang lưu dạng data URL trong IndexedDB, phù hợp demo nhưng cần object storage cho production. Chưa có automated test đầy đủ và chưa có signing key phát hành.
