const form = document.getElementById('survey-form');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const surveyList = document.getElementById('survey-list');
const successMessage = document.getElementById('success-message');
const networkStatus = document.getElementById('network-status');
const nativeMessage = document.getElementById('native-message');
const photoPreview = document.getElementById('photo-preview');
const photoImage = document.getElementById('photo-image');
const locationPreview = document.getElementById('location-preview');
const webPhotoInput = document.getElementById('web-photo-input');

const MOCK_API = 'https://jsonplaceholder.typicode.com/posts';
let currentPhoto = null;
let currentLocation = null;

function isNativeApp() {
    return Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
}

function plugins() {
    return (window.Capacitor && window.Capacitor.Plugins) || {};
}

function showNativeMessage(message, isError = false) {
    nativeMessage.textContent = message;
    nativeMessage.classList.toggle('error', isError);
    nativeMessage.classList.remove('hidden');
}

async function loadSurveys() {
    const surveys = await getAllSurveys();
    const pending = await getAllPendingSurveys();
    const pendingIds = new Set(pending.map(survey => survey.id));
    const normalized = surveys.map(survey => survey.syncStatus
        ? survey
        : { ...survey, syncStatus: pendingIds.has(survey.id) ? 'pending' : 'synced' });
    normalized.sort((a, b) => Number(b.id) - Number(a.id));
    renderSurveys(normalized);
    updateDashboard(normalized);
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    clearErrors();
    const survey = {
        id: Date.now().toString(),
        fullName: document.getElementById('fullName').value.trim(),
        area: document.getElementById('area').value,
        category: document.getElementById('category').value.trim(),
        rating: document.getElementById('rating').value,
        comment: document.getElementById('comment').value.trim(),
        timestamp: new Date().toLocaleString('vi-VN'),
        photo: currentPhoto,
        location: currentLocation,
        syncStatus: 'pending'
    };
    const required = ['fullName', 'area', 'category', 'rating', 'comment'];
    if (!required.every(field => {
        if (survey[field]) return true;
        showError(field);
        return false;
    })) return;

    try {
        await addSurvey(survey);
        await addPendingSurvey(survey);
        await loadSurveys();
        successMessage.textContent = navigator.onLine ? 'Đã lưu khảo sát, đang đồng bộ...' : 'Đã lưu khảo sát khi offline.';
        successMessage.classList.remove('hidden');
        showNativeMessage('Đã lưu khảo sát, ảnh và vị trí trên thiết bị.', false);
        setTimeout(() => successMessage.classList.add('hidden'), 3000);
        form.reset();
        resetNativeFields();
        requestSync().catch(error => console.warn('[Sync] Không thể đồng bộ ngay:', error));
        notify('Khảo sát đã được lưu', 'Dữ liệu đã được lưu trên thiết bị.').catch(error => console.warn('[Notification] Bỏ qua:', error));
    } catch (error) {
        console.error('[App] Lỗi khi lưu khảo sát:', error && error.name || error, error && error.message || '');
        showNativeMessage(`Không thể lưu khảo sát: ${(error && error.message) || 'lỗi IndexedDB'}`, true);
    }
});

function showError(fieldId) {
    document.getElementById(fieldId).closest('.form-group').classList.add('error');
}

function clearErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => group.classList.remove('error'));
}

function appendText(parent, tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value || '';
    parent.appendChild(element);
    return element;
}

function appendDetail(parent, label, value) {
    const item = document.createElement('div');
    item.className = 'detail-item';
    appendText(item, 'span', '', label);
    appendText(item, 'span', '', value);
    parent.appendChild(item);
}

function renderSurveys(surveys) {
    while (surveyList.firstChild) {
        surveyList.removeChild(surveyList.firstChild);
    }
    if (!surveys.length) {
        appendText(surveyList, 'div', 'empty-state', 'Chưa có dữ liệu khảo sát.');
        return;
    }
    surveys.forEach(survey => {
        const card = document.createElement('div');
        card.className = 'survey-card';
        const header = document.createElement('div');
        header.className = 'survey-header';
        appendText(header, 'div', 'survey-user', survey.fullName);
        appendText(header, 'div', 'survey-time', survey.timestamp);
        card.appendChild(header);
        const details = document.createElement('div');
        details.className = 'survey-details';
        appendDetail(details, 'Khu vực:', survey.area);
        appendDetail(details, 'Hạng mục:', survey.category);
        card.appendChild(details);
        appendText(card, 'div', `survey-rating ${ratingClass(survey.rating)}`, survey.rating);
        appendText(card, 'div', 'survey-comment', survey.comment);
        if (survey.location) {
            appendText(card, 'div', 'survey-location', `Vị trí: ${survey.location.latitude.toFixed(6)}, ${survey.location.longitude.toFixed(6)}`);
        }
        if (survey.photo && survey.photo.dataUrl) {
            const image = document.createElement('img');
            image.className = 'survey-photo';
            image.src = survey.photo.dataUrl;
            image.alt = 'Ảnh hiện trường';
            card.appendChild(image);
        }
        const footer = document.createElement('div');
        footer.className = 'survey-footer';
        appendText(footer, 'span', `sync-status ${survey.syncStatus || 'synced'}`, syncLabel(survey.syncStatus));
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn-delete';
        deleteButton.textContent = 'Xóa khảo sát';
        deleteButton.addEventListener('click', () => deleteSurvey(survey.id));
        footer.appendChild(deleteButton);
        card.appendChild(footer);
        surveyList.appendChild(card);
    });
}

function ratingClass(rating) {
    return { 'Rất tốt': 'rating-rtot', Tốt: 'rating-tot', 'Trung bình': 'rating-tb', Kém: 'rating-kem', 'Rất kém': 'rating-rkem' }[rating] || 'rating-tb';
}

function syncLabel(status) {
    return { synced: 'Đã đồng bộ', pending: 'Chờ đồng bộ', failed: 'Đồng bộ lỗi' }[status] || 'Đã đồng bộ';
}

async function deleteSurvey(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa khảo sát này?')) return;
    await deleteSurveyFromDB(id);
    await loadSurveys();
}

function updateDashboard(surveys) {
    totalCount.textContent = surveys.length;
    completedCount.textContent = surveys.filter(survey => survey.syncStatus === 'synced').length;
    pendingCount.textContent = surveys.filter(survey => survey.syncStatus !== 'synced').length;
}

async function syncNow() {
    if (!navigator.onLine) return;
    const pending = await getAllPendingSurveys();
    for (const survey of pending) {
        try {
            await updateSurveyStatus(survey.id, 'pending');
            const response = await fetch(MOCK_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(survey) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await response.json();
            await deletePendingSurvey(survey.id);
            await updateSurveyStatus(survey.id, 'synced');
        } catch (error) {
            console.warn('[Sync] Gửi thất bại:', error.message);
            await updateSurveyStatus(survey.id, 'failed');
        }
    }
    await loadSurveys();
}

async function requestSync() {
    if (navigator.onLine) await syncNow();
    if (isNativeApp()) return;
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-surveys');
    } catch (error) {
        console.warn('[Sync] Background Sync không khả dụng:', error);
    }
}

async function takePhoto() {
    const Camera = plugins().Camera;
    if (!Camera) {
        webPhotoInput.click();
        return;
    }
    try {
        const photo = await Promise.race([
            Camera.takePhoto({ quality: 75, targetWidth: 1280, correctOrientation: true }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Camera plugin timeout')), 8000))
        ]);
        const dataUrl = photo.thumbnail && photo.thumbnail.indexOf('data:') === 0
            ? photo.thumbnail
            : `data:image/jpeg;base64,${photo.thumbnail}`;
        currentPhoto = { dataUrl, format: 'jpeg' };
        photoImage.src = dataUrl;
        photoPreview.classList.remove('hidden');
        nativeMessage.classList.add('hidden');
    } catch (error) {
        console.warn('[Camera] Native camera không phản hồi, dùng camera trình duyệt:', error);
        webPhotoInput.click();
    }
}

async function getLocation() {
    const Geolocation = plugins().Geolocation;
    if (!Geolocation) {
        if (!navigator.geolocation) {
            showNativeMessage('Trình duyệt này không hỗ trợ lấy vị trí.', true);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            position => setLocation(position),
            () => showNativeMessage('Không thể lấy vị trí. Hãy cấp quyền Location cho Brave.', true),
            { enableHighAccuracy: true, timeout: 10000 }
        );
        return;
    }
    try {
        const position = await Promise.race([
            Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Location plugin timeout')), 12000))
        ]);
        setLocation(position);
    } catch (error) {
        console.warn('[Location] Native GPS không phản hồi, dùng GPS trình duyệt:', error);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                setLocation,
                () => showNativeMessage('Không thể lấy vị trí. Hãy cấp quyền Location và bật GPS.', true),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            showNativeMessage('Không thể lấy vị trí. Hãy kiểm tra quyền GPS.', true);
        }
    }
}

function setLocation(position) {
    currentLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    locationPreview.textContent = `Đã lấy vị trí: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
    locationPreview.classList.remove('hidden');
    nativeMessage.classList.add('hidden');
}

webPhotoInput.addEventListener('change', () => {
    const [file] = webPhotoInput.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        currentPhoto = { dataUrl: reader.result, format: file.type.split('/')[1] || 'jpeg' };
        photoImage.src = reader.result;
        photoPreview.classList.remove('hidden');
        nativeMessage.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});

function resetNativeFields() {
    currentPhoto = null;
    currentLocation = null;
    photoImage.removeAttribute('src');
    photoPreview.classList.add('hidden');
    locationPreview.classList.add('hidden');
}

async function notify(title, body) {
    const LocalNotifications = plugins().LocalNotifications;
    if (!LocalNotifications) return;
    try {
        const permission = await Promise.race([
            LocalNotifications.requestPermissions(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Notification plugin timeout')), 3000))
        ]);
        if (permission.display !== 'granted') return;
        await Promise.race([
            LocalNotifications.schedule({ notifications: [{ title, body, id: Date.now() % 2147483647, schedule: { at: new Date(Date.now() + 500) } }] }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Notification schedule timeout')), 3000))
        ]);
    } catch (error) {
        console.warn('[Notification] Không thể gửi thông báo:', error);
    }
}

async function updateNetworkStatus(status) {
    const online = Boolean(status.connected);
    networkStatus.textContent = online ? '🟢 Online' : '🔴 Offline';
    networkStatus.classList.toggle('offline', !online);
    if (online) await syncNow();
}

async function setupNetwork() {
    const Network = plugins().Network;
    await updateNetworkStatus({ connected: navigator.onLine });
    if (Network) {
        try {
            const status = await Promise.race([
                Network.getStatus(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Network plugin timeout')), 3000))
            ]);
            await Network.addListener('networkStatusChange', updateNetworkStatus);
            await updateNetworkStatus(status);
        } catch (error) {
            console.warn('[Network] Native plugin không phản hồi, dùng trạng thái trình duyệt:', error);
            await updateNetworkStatus({ connected: navigator.onLine });
            window.addEventListener('online', () => updateNetworkStatus({ connected: true }));
            window.addEventListener('offline', () => updateNetworkStatus({ connected: false }));
        }
    } else {
        await updateNetworkStatus({ connected: navigator.onLine });
        window.addEventListener('online', () => updateNetworkStatus({ connected: true }));
        window.addEventListener('offline', () => updateNetworkStatus({ connected: false }));
    }
}

window.addEventListener('error', event => {
    console.error('[App] JavaScript error:', event.error || event.message);
    if (networkStatus.textContent.includes('Đang')) {
        networkStatus.textContent = '🔴 Offline';
        networkStatus.classList.add('offline');
    }
});

document.getElementById('btn-photo').addEventListener('click', takePhoto);
document.getElementById('btn-location').addEventListener('click', getLocation);
document.getElementById('btn-remove-photo').addEventListener('click', () => {
    currentPhoto = null;
    photoImage.removeAttribute('src');
    photoPreview.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.error('[App] Đăng ký SW thất bại:', error)));
}

let deferredPrompt;
const installBtn = document.getElementById('btn-install');
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.classList.remove('hidden');
});
installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add('hidden');
});
window.addEventListener('appinstalled', () => installBtn.classList.add('hidden'));

loadSurveys().catch(error => {
    console.error('[App] Không thể tải khảo sát:', error);
    showNativeMessage('Không thể đọc dữ liệu cục bộ. Hãy khởi động lại ứng dụng.', true);
});
setupNetwork().catch(error => console.error('[Network] Không thể khởi tạo:', error));