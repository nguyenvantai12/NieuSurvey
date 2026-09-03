// ==========================================
// main.js — Giao diện + Kết nối IndexedDB
// ==========================================

// DOM Elements
const form = document.getElementById('survey-form');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const surveyList = document.getElementById('survey-list');
const successMessage = document.getElementById('success-message');

// ==========================================
// KHỞI ĐỘNG: Tải dữ liệu từ IndexedDB khi trang mở
// ==========================================
// Ngay khi trang load xong, đọc toàn bộ dữ liệu từ DB và hiển thị lên màn hình
// (Đây là điểm khác biệt quan trọng so với biến mảng tạm — dữ liệu tồn tại sau F5)
getAllSurveys().then(savedSurveys => {
    // Sắp xếp mới nhất lên đầu (dựa vào id là timestamp)
    const sorted = savedSurveys.sort((a, b) => Number(b.id) - Number(a.id));
    renderSurveys(sorted);
    updateDashboard(sorted.length);
});

// ==========================================
// EVENT: Form Submit
// ==========================================
form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors();

    // Lấy giá trị từ các ô nhập liệu
    const fullName = document.getElementById('fullName').value.trim();
    const area = document.getElementById('area').value;
    const category = document.getElementById('category').value.trim();
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value.trim();

    // Validation
    let isValid = true;
    if (!fullName) { showError('fullName'); isValid = false; }
    if (!area) { showError('area'); isValid = false; }
    if (!category) { showError('category'); isValid = false; }
    if (!rating) { showError('rating'); isValid = false; }
    if (!comment) { showError('comment'); isValid = false; }
    if (!isValid) return;

    // Tạo object khảo sát mới
    const newSurvey = {
        id: Date.now().toString(),
        fullName,
        area,
        category,
        rating,
        comment,
        timestamp: new Date().toLocaleString('vi-VN')
    };

    // Lưu vào IndexedDB (hiển thị lên màn hình)
    addSurvey(newSurvey)
        .then(() => {
            // Đồng thời thêm vào hàng đợi chờ đồng bộ lên server
            return addPendingSurvey(newSurvey);
        })
        .then(() => {
            // Đăng ký Background Sync event với Service Worker
            // SW sẽ lắng nghe sự kiện 'sync-surveys' và xử lý khi có mạng
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(swReg => {
                    return swReg.sync.register('sync-surveys');
                }).then(() => {
                    console.log('[App] Đã đăng ký Background Sync: sync-surveys');
                }).catch(err => {
                    console.warn('[App] Background Sync không khả dụng, thử gửi trực tiếp:', err);
                    // Fallback: nếu Background Sync không hỗ trợ, gửi ngay lập tức
                    syncNow();
                });
            } else {
                // Trình duyệt không hỗ trợ Background Sync → gửi ngay
                syncNow();
            }
            return getAllSurveys();
        })
        .then(allSurveys => {
            const sorted = allSurveys.sort((a, b) => Number(b.id) - Number(a.id));
            renderSurveys(sorted);
            updateDashboard(sorted.length);

            // Hiển thị thông báo thành công
            successMessage.classList.remove('hidden');
            setTimeout(() => successMessage.classList.add('hidden'), 3000);

            // Xóa trắng form
            form.reset();
        })
        .catch(err => console.error('Lỗi khi lưu khảo sát:', err));
});

// ==========================================
// VALIDATION HELPERS
// ==========================================
function showError(fieldId) {
    document.getElementById(fieldId).closest('.form-group').classList.add('error');
}

function clearErrors() {
    document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
}

// ==========================================
// RENDER: Vẽ danh sách thẻ khảo sát ra màn hình
// ==========================================
function renderSurveys(surveys) {
    if (!surveys || surveys.length === 0) {
        surveyList.innerHTML = '<div class="empty-state">Chưa có dữ liệu khảo sát.</div>';
        return;
    }

    surveyList.innerHTML = '';
    surveys.forEach(survey => {
        let ratingClass = 'rating-tb';
        if (survey.rating === 'Rất tốt') ratingClass = 'rating-rtot';
        else if (survey.rating === 'Tốt') ratingClass = 'rating-tot';
        else if (survey.rating === 'Trung bình') ratingClass = 'rating-tb';
        else if (survey.rating === 'Kém') ratingClass = 'rating-kem';
        else if (survey.rating === 'Rất kém') ratingClass = 'rating-rkem';

        const card = document.createElement('div');
        card.className = 'survey-card';
        card.innerHTML = `
            <div class="survey-header">
                <div class="survey-user">${survey.fullName}</div>
                <div class="survey-time">${survey.timestamp}</div>
            </div>
            <div class="survey-details">
                <div class="detail-item"><span>Khu vực:</span><span>${survey.area}</span></div>
                <div class="detail-item"><span>Hạng mục:</span><span>${survey.category}</span></div>
            </div>
            <div class="survey-rating ${ratingClass}">${survey.rating}</div>
            <div class="survey-comment">${survey.comment}</div>
            <button class="btn-delete" onclick="deleteSurvey('${survey.id}')">Xóa khảo sát</button>
        `;
        surveyList.appendChild(card);
    });
}

// ==========================================
// XÓA: Xóa khảo sát khỏi IndexedDB và render lại
// ==========================================
window.deleteSurvey = function(id) {
    if (confirm('Bạn có chắc chắn muốn xóa khảo sát này?')) {
        deleteSurveyFromDB(id)
            .then(() => getAllSurveys())
            .then(allSurveys => {
                const sorted = allSurveys.sort((a, b) => Number(b.id) - Number(a.id));
                renderSurveys(sorted);
                updateDashboard(sorted.length);
            });
    }
};

// ==========================================
// DASHBOARD: Cập nhật bộ đếm thống kê
// ==========================================
function updateDashboard(total) {
    totalCount.textContent = total;
    completedCount.textContent = total;
}

// ==========================================
// SYNC: Gửi dữ liệu trong hàng đợi lên server (Fallback)
// Dùng khi trình duyệt không hỗ trợ Background Sync API
// ==========================================
function syncNow() {
    const MOCK_API = 'https://jsonplaceholder.typicode.com/posts';

    getAllPendingSurveys().then(pendingList => {
        if (pendingList.length === 0) return;

        console.log(`[Sync] Đang gửi ${pendingList.length} khảo sát lên server...`);

        // Gửi từng item trong hàng đợi
        const syncPromises = pendingList.map(survey => {
            return fetch(MOCK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(survey)
            })
            .then(res => res.json())
            .then(result => {
                console.log('[Sync] ✅ Đã gửi thành công, server trả về ID:', result.id);
                // Xóa khỏi hàng đợi sau khi gửi thành công
                return deletePendingSurvey(survey.id);
            })
            .catch(err => {
                console.warn('[Sync] ❌ Gửi thất bại (có thể đang mất mạng):', err.message);
                // Không xóa khỏi hàng đợi → lần sau sẽ thử lại
            });
        });

        return Promise.all(syncPromises);
    });
}

// ==========================================
// ĐĂNG KÝ SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[App] Service Worker đã đăng ký, scope:', reg.scope))
            .catch(err => console.error('[App] Đăng ký SW thất bại:', err));
    });
}

// ==========================================
// C�I �?T ?NG D?NG (Add to Home Screen - A2HS)
// ==========================================
let deferredPrompt;
const installBtn = document.getElementById('btn-install');

window.addEventListener('beforeinstallprompt', (e) => {
    // 1. Ngan tr�nh duy?t t? d?ng hi?n th? popup m?c d?nh
    e.preventDefault();
    // 2. Luu l?i event d? k�ch ho?t sau
    deferredPrompt = e;
    // 3. Hi?n th? n�t c�i d?t c?a ri�ng ch�ng ta
    installBtn.classList.remove('hidden');
    console.log('[App] �� s?n s�ng d? c�i d?t PWA');
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        // 1. K�ch ho?t prompt c�i d?t
        deferredPrompt.prompt();
        // 2. Ch? ngu?i d�ng ph?n h?i (�?ng � ho?c H?y)
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[App] Ngu?i d�ng d� ch?n:', outcome);
        // 3. Reset l?i bi?n deferredPrompt
        deferredPrompt = null;
        // 4. ?n n�t di v� d� c�i d?t xong
        installBtn.classList.add('hidden');
    }
});

window.addEventListener('appinstalled', () => {
    console.log('[App] PWA d� du?c c�i d?t th�nh c�ng!');
    installBtn.classList.add('hidden');
});

