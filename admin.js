const API_BASE_URL = "https://elearning-backend-g0ix.onrender.com";
let courses = [];

function fetchCoursesFromBackend() {
    fetch(API_BASE_URL + "/api/courses") 
        .then(response => response.json())
        .then(data => {
            courses = data;
            renderAdminTable();
        })
        .catch(error => console.error('Error fetching courses:', error));
}

function renderAdminTable() {
    const tbody = document.getElementById('adminCourseTableBody');
    tbody.innerHTML = '';

    if (courses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="padding: 15px; text-align: center;">No courses available in database.</td></tr>`;
        return;
    }

    courses.forEach(course => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        tr.innerHTML = `
            <td style="padding: 12px; font-weight: 600;">${course.title}</td>
            <td style="padding: 12px;">${course.category}</td>
            <td style="padding: 12px;">${course.instructor}</td>
            <td style="padding: 12px;">
                <button onclick="deleteCourse(${course.id})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleAddCourse(e) {
    e.preventDefault();
    
    const newCourse = {
        title: document.getElementById('adminTitle').value,
        category: document.getElementById('adminCategory').value,
        description: document.getElementById('adminDesc').value,
        instructor: document.getElementById('adminInstructor').value,
        videoUrl: document.getElementById('adminVideo').value,
        quizQuestion: document.getElementById('adminQuizQ').value,
        quizOptions: document.getElementById('adminQuizOpts').value,
        quizCorrect: parseInt(document.getElementById('adminQuizCorrect').value)
    };

    fetch(API_BASE_URL + "/api/courses", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
    })
    .then(response => response.json())
    .then(data => {
        alert("🎉 Course successfully added to Database!");
        document.getElementById('addCourseForm').reset();
        fetchCoursesFromBackend();
    })
    .catch(error => {
        console.error('Error adding course:', error);
        alert("Failed to add course to database.");
    });
}

function deleteCourse(id) {
    if (confirm("Are you sure you want to delete this course from database?")) {
        fetch(`${API_BASE_URL}/api/courses/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            fetchCoursesFromBackend();
        })
        .catch(error => console.error('Error deleting course:', error));
    }
}

function renderAdminStudents() {
    const tbody = document.getElementById('adminStudentTableBody');
    tbody.innerHTML = '';

    const students = JSON.parse(localStorage.getItem('allStudents')) || [];

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="padding: 15px; text-align: center;">No students registered yet.</td></tr>`;
        return;
    }

    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        tr.innerHTML = `
            <td style="padding: 12px; font-weight: 600;">${student.name}</td>
            <td style="padding: 12px;">${student.email}</td>
            <td style="padding: 12px; color: #10b981; font-weight: bold;">${student.completed} Courses Completed</td>
        `;
        tbody.appendChild(tr);
    });
}

window.onload = () => {
    fetchCoursesFromBackend();
    renderAdminStudents();
};