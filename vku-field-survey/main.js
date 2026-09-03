// State management (Mảng lưu trữ dữ liệu khảo sát trong bộ nhớ tạm)
let surveys = [];

// DOM Elements
const form = document.getElementById('survey-form');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count'); // Ở bản web app cơ bản, chưa hoàn thành mặc định là 0
const surveyList = document.getElementById('survey-list');
const successMessage = document.getElementById('success-message');

// Event Listener for form submit
form.addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang
    
    // Xóa các lỗi hiển thị trước đó
    clearErrors();

    // Lấy giá trị từ các ô nhập liệu
    const fullName = document.getElementById('fullName').value.trim();
    const area = document.getElementById('area').value;
    const category = document.getElementById('category').value.trim();
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value.trim();

    // Kiểm tra tính hợp lệ (Validation)
    let isValid = true;

    if (!fullName) {
        showError('fullName');
        isValid = false;
    }
    if (!area) {
        showError('area');
        isValid = false;
    }
    if (!category) {
        showError('category');
        isValid = false;
    }
    if (!rating) {
        showError('rating');
        isValid = false;
    }
    if (!comment) {
        showError('comment');
        isValid = false;
    }

    // Nếu form không hợp lệ, dừng tại đây
    if (!isValid) return;

    // Tạo object khảo sát mới
    const newSurvey = {
        id: Date.now().toString(), // Tạo ID duy nhất bằng timestamp
        fullName,
        area,
        category,
        rating,
        comment,
        timestamp: new Date().toLocaleString('vi-VN')
    };

    // Thêm vào mảng (unshift để hiển thị mới nhất lên đầu)
    surveys.unshift(newSurvey);

    // Cập nhật lại giao diện người dùng
    renderSurveys();
    updateDashboard();

    // Hiển thị thông báo thành công trong 3 giây
    successMessage.classList.remove('hidden');
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);

    // Xóa trắng form
    form.reset();
});

// Hàm hiển thị lỗi
function showError(fieldId) {
    const group = document.getElementById(fieldId).closest('.form-group');
    group.classList.add('error');
}

// Hàm xóa lỗi
function clearErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => group.classList.remove('error'));
}

// Hàm render danh sách khảo sát ra giao diện
function renderSurveys() {
    // Nếu không có dữ liệu, hiển thị empty state
    if (surveys.length === 0) {
        surveyList.innerHTML = '<div class="empty-state">Chưa có dữ liệu khảo sát.</div>';
        return;
    }

    surveyList.innerHTML = '';

    surveys.forEach(survey => {
        // Xác định class màu cho từng mức độ đánh giá
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
                <div class="detail-item">
                    <span>Khu vực:</span>
                    <span>${survey.area}</span>
                </div>
                <div class="detail-item">
                    <span>Hạng mục:</span>
                    <span>${survey.category}</span>
                </div>
            </div>
            <div class="survey-rating ${ratingClass}">${survey.rating}</div>
            <div class="survey-comment">${survey.comment}</div>
            <button class="btn-delete" onclick="deleteSurvey('${survey.id}')">
                Xóa khảo sát
            </button>
        `;
        surveyList.appendChild(card);
    });
}

// Hàm xóa khảo sát
window.deleteSurvey = function(id) {
    if (confirm('Bạn có chắc chắn muốn xóa khảo sát này?')) {
        surveys = surveys.filter(survey => survey.id !== id);
        renderSurveys();
        updateDashboard();
    }
}

// Hàm cập nhật số lượng trên Dashboard
function updateDashboard() {
    const total = surveys.length;
    totalCount.textContent = total;
    completedCount.textContent = total;
}
