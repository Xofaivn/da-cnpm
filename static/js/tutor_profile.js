function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Avatar upload
document.getElementById('avatar-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            showToast('File size must be less than 2MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('avatar-preview').src = e.target.result;
            document.getElementById('profile-avatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('avatar-clear').addEventListener('click', function () {
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    document.getElementById('avatar-preview').src = defaultAvatar;
    document.getElementById('profile-avatar').src = defaultAvatar;
    document.getElementById('avatar-input').value = '';
});

// Bio character count
const bioInput = document.getElementById('bio-input');
const bioCount = document.getElementById('bio-count');
bioInput.addEventListener('input', function () {
    bioCount.textContent = `${this.value.length}/500`;
    document.getElementById('profile-bio').textContent = this.value || 'No bio yet.';
});

// Teaching modes
const modeButtons = document.querySelectorAll('.mode-btn');
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        updatePreview();
    });
});

// Add chip function
function addChip(listEl, value, updateFn) {
    if (!value) return;
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const exists = Array.from(listEl.children).some(chip =>
        chip.textContent.trim().replace('×', '').trim().toLowerCase() === trimmedValue.toLowerCase()
    );
    if (exists) {
        showToast('Item already exists', 'error');
        return;
    }

    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `${trimmedValue}<span class="remove-chip" onclick="this.parentElement.remove(); updatePreview()">&times;</span>`;
    listEl.appendChild(chip);
    updatePreview();
}

function addLanguage() {
    const input = document.getElementById('language-input');
    addChip(document.getElementById('languages-list'), input.value);
    input.value = '';
}

function addSkill() {
    const input = document.getElementById('skill-input');
    addChip(document.getElementById('skills-list'), input.value);
    input.value = '';
}

function addCourse() {
    const input = document.getElementById('course-input');
    addChip(document.getElementById('courses-list'), input.value);
    input.value = '';
}

// Enter key handlers
document.getElementById('language-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addLanguage();
    }
});

document.getElementById('skill-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addSkill();
    }
});

document.getElementById('course-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addCourse();
    }
});

// Update preview
function updatePreview() {
    // Update teaching modes
    const inPersonActive = document.querySelector('[data-mode="in-person"]').classList.contains('active');
    const onlineActive = document.querySelector('[data-mode="online"]').classList.contains('active');
    document.getElementById('preview-inperson').style.display = inPersonActive ? 'block' : 'none';
    document.getElementById('preview-online').style.display = onlineActive ? 'block' : 'none';

    // Update languages
    const languages = Array.from(document.getElementById('languages-list').children)
        .map(chip => `<span class="skill-tag">${chip.textContent.replace('×', '').trim()}</span>`)
        .join('');
    document.getElementById('preview-languages').innerHTML = languages || '<span class="muted">No languages added</span>';

    // Update skills
    const skills = Array.from(document.getElementById('skills-list').children)
        .map(chip => `<span class="skill-tag">${chip.textContent.replace('×', '').trim()}</span>`)
        .join('');
    document.getElementById('preview-skills').innerHTML = skills || '<span class="muted">No skills added</span>';

    // Update courses
    const courses = Array.from(document.getElementById('courses-list').children)
        .map(chip => `<div class="profile-item">${chip.textContent.replace('×', '').trim()}</div>`)
        .join('');
    document.getElementById('preview-courses').innerHTML = courses || '<div class="profile-item muted">No courses added</div>';
}

// Save profile
document.getElementById('save-profile').addEventListener('click', function () {
    const inPersonActive = document.querySelector('[data-mode="in-person"]').classList.contains('active');
    const onlineActive = document.querySelector('[data-mode="online"]').classList.contains('active');

    if (!inPersonActive && !onlineActive) {
        showToast('Please select at least one teaching mode', 'error');
        return;
    }

    // Simulate save
    showToast('Profile saved successfully!', 'success');
});

// Preview card
document.getElementById('preview-card').addEventListener('click', function () {
    showToast('Preview feature coming soon!', 'success');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function () {
    if (confirm('Are you sure you want to log out?')) {
        showToast('Logging out...', 'success');
    }
});

// Initialize preview
updatePreview();