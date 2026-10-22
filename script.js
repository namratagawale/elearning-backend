const API_BASE_URL = "https://elearning-backend-g0ix.onrender.com";
let courses = [];
let activeCategory = 'All';
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
let completedCourses = JSON.parse(localStorage.getItem('completedCourses')) || [];
let isRegisterMode = false;


function fetchCoursesFromBackend() {
    fetch(API_BASE_URL + "/api/courses") 
        .then(response => response.json())
        .then(data => {
            courses = data;
            loadCourses(courses);
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            document.getElementById('courseContainer').innerHTML = `<p style="color:red;">Failed to connect to backend server. Make sure Spring Boot is running.</p>`;
        });
}

function loadCourses(filteredList = courses) {
    const container = document.getElementById('courseContainer');
    container.innerHTML = '';

    if (filteredList.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1;">No courses found matching your criteria.</p>`;
        return;
    }

    filteredList.forEach(course => {
        const isCompleted = completedCourses.includes(course.id);
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <div>
                <span class="badge">${course.category}</span>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="instructor">👨‍🏫 Instructor: ${course.instructor}</div>
            </div>
            <button class="btn-card" onclick="playLesson(${course.id})">
                ${isCompleted ? '✅ Revise Lesson & Quiz' : 'Watch Lesson & Quiz'}
            </button>
        `;
        container.appendChild(card);
    });
}

function filterCourses(category) {
    activeCategory = category;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    handleSearch();
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = courses.filter(c => {
        const matchesCategory = (activeCategory === 'All' || c.category === activeCategory);
        const matchesSearch = c.title.toLowerCase().includes(query) || c.instructor.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    loadCourses(filtered);
}

function playLesson(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    document.getElementById('currentLessonTitle').innerText = course.title;
    document.getElementById('videoPlayer').src = course.videoUrl;

    document.getElementById('quizQuestion').innerText = course.quizQuestion;
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    document.getElementById('quizResult').innerText = '';

    const optionsArray = course.quizOptions ? course.quizOptions.split(',').map(s => s.trim()) : [];

    optionsArray.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = opt;
        btn.onclick = () => checkQuizAnswer(idx, course.quizCorrect, courseId);
        optionsContainer.appendChild(btn);
    });

    showSection('video');
}

function checkQuizAnswer(selected, correct, courseId) {
    const resultBox = document.getElementById('quizResult');
    if (selected === correct) {
        resultBox.style.color = '#10b981';
        resultBox.innerText = '✅ Correct! Course completed & Certificate unlocked!';
        
        if (!completedCourses.includes(courseId)) {
            completedCourses.push(courseId);
            localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
            updateStudentProgressInStorage();
        }
    } else {
        resultBox.style.color = '#ef4444';
        resultBox.innerText = '❌ Incorrect. Try again!';
    }
}

function updateStudentProgressInStorage() {
    if (!currentUser) return;
    let students = JSON.parse(localStorage.getItem('allStudents')) || [];
    const index = students.findIndex(s => s.email === currentUser.email);
    
    if (index !== -1) {
        students[index].completed = completedCourses.length;
    } else {
        students.push({ name: currentUser.name, email: currentUser.email, completed: completedCourses.length });
    }
    localStorage.setItem('allStudents', JSON.stringify(students));
}

function showSection(sectionName) {
    document.getElementById('heroSection').classList.add('hidden');
    document.getElementById('coursesSection').classList.add('hidden');
    document.getElementById('videoSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');

    if (sectionName === 'courses') {
        document.getElementById('heroSection').classList.remove('hidden');
        document.getElementById('coursesSection').classList.remove('hidden');
    } else if (sectionName === 'video') {
        document.getElementById('videoSection').classList.remove('hidden');
    } else if (sectionName === 'dashboard') {
        document.getElementById('dashboardSection').classList.remove('hidden');
        renderDashboard();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeVideo() {
    document.getElementById('videoPlayer').src = '';
    showSection('courses');
}

function showDashboard() {
    if (!currentUser) {
        alert("Please login first to view your progress and certificates!");
        openAuthModal('login');
        return;
    }
    showSection('dashboard');
}

function renderDashboard() {
    const total = courses.length;
    const completed = completedCourses.length;
    document.getElementById('completedCount').innerText = completed;
    document.getElementById('totalCount').innerText = total;

    const percent = total > 0 ? (completed / total) * 100 : 0;
    document.getElementById('progressBarFill').style.width = percent + '%';

    const certContainer = document.getElementById('certificateContainer');
    certContainer.innerHTML = '';

    if (completed === 0) {
        certContainer.innerHTML = `<p>Complete course quizzes to unlock certificates!</p>`;
        return;
    }

    completedCourses.forEach(id => {
        const c = courses.find(item => item.id === id);
        if (c) {
            const card = document.createElement('div');
            card.className = 'cert-badge-card';
            card.innerHTML = `<h4>🏆 ${c.title}</h4><small>Click to view certificate</small>`;
            card.onclick = () => openCertificate(c.title);
            certContainer.appendChild(card);
        }
    });
}

function openCertificate(courseTitle) {
    document.getElementById('certStudentName').innerText = currentUser ? currentUser.name : "Student";
    document.getElementById('certCourseName').innerText = courseTitle;
    document.getElementById('certModal').classList.remove('hidden');
}

function closeCertificate() {
    document.getElementById('certModal').classList.add('hidden');
}

function openAuthModal(mode) {
    isRegisterMode = (mode === 'register');
    document.getElementById('modalTitle').innerText = isRegisterMode ? 'Register' : 'Login';
    document.getElementById('modalSubmitBtn').innerText = isRegisterMode ? 'Register' : 'Login';
    document.getElementById('nameFieldGroup').classList.toggle('hidden', !isRegisterMode);
    document.getElementById('switchAuthText').innerHTML = isRegisterMode 
        ? `Already have an account? <a href="#" onclick="toggleAuthMode()">Login here</a>`
        : `Don't have an account? <a href="#" onclick="toggleAuthMode()">Register here</a>`;
    document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function toggleAuthMode() {
    openAuthModal(isRegisterMode ? 'login' : 'register');
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const name = isRegisterMode ? document.getElementById('regName').value : email.split('@')[0];

    if (email === "admin@elearning.com" && password === "admin123") {
        currentUser = { name: "System Admin", email, role: 'Admin' };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeAuthModal();
        alert("Welcome Admin! Opening Control Panel...");
        window.location.href = 'admin.html';
        return;
    }

    currentUser = { name, email, role: 'Student' };
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateStudentProgressInStorage();

    closeAuthModal();
    alert(`Welcome Student ${name}!`);
    updateUserUI();
}

function updateUserUI() {
    if (currentUser) {
        document.getElementById('userProfileDisplay').classList.remove('hidden');
        document.getElementById('navUsername').innerText = currentUser.name;
        document.getElementById('authBtn').innerText = 'Logout';
        document.getElementById('authBtn').setAttribute('onclick', 'handleLogout()');
    }
}

function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    document.getElementById('userProfileDisplay').classList.add('hidden');
    document.getElementById('authBtn').innerText = 'Login / Register';
    document.getElementById('authBtn').setAttribute('onclick', "openAuthModal('login')");
    showSection('courses');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('themeBtn').innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

window.onload = () => {
    fetchCoursesFromBackend();
    updateUserUI();
};