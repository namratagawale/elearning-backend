const API_BASE_URL = "https://elearning-backend-g0ix.onrender.com";
let courses = [];

window.onload = () => {
    fetchCoursesFromBackend();
    renderAdminStudents();
    addQuizQuestionField();
};

function fetchCoursesFromBackend() {
    fetch(API_BASE_URL + "/api/courses") 
        .then(response => response.json())
        .then(data => {
            courses = data;
            renderAdminTable();
        })
        .catch(error => console.error('Error fetching courses:', error));
}

function addQuizQuestionField() {
    const container = document.getElementById('quizListContainer');
    const div = document.createElement('div');
    div.className = 'quiz-question-block';
    div.style.cssText = "background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 10px;";
    
    div.innerHTML = `
        <div class="form-group" style="margin-bottom: 8px;">
            <label>Question Text</label>
            <input type="text" class="q-text" required placeholder="Enter question" style="width:100%; padding:6px;">
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
            <label>Options (Comma separated)</label>
            <input type="text" class="q-options" required placeholder="Option 1, Option 2, Option 3, Option 4" style="width:100%; padding:6px;">
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
            <label>Correct Option Index (0 = First, 1 = Second...)</label>
            <input type="number" class="q-correct" min="0" max="3" value="0" required style="width:100%; padding:6px;">
        </div>
        <button type="button" onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove Question</button>
    `;
    container.appendChild(div);
}

function handleAddCourse(e) {
    e.preventDefault();
    
  
    const quizBlocks = document.querySelectorAll('.quiz-question-block');
    const quizzesArray = [];

    quizBlocks.forEach(block => {
        quizzesArray.push({
            question: block.querySelector('.q-text').value,
            options: block.querySelector('.q-options').value.split(',').map(s => s.trim()),
            correct: parseInt(block.querySelector('.q-correct').value)
        });
    });

    const newCourse = {
        title: document.getElementById('adminTitle').value,
        category: document.getElementById('adminCategory').value,
        description: document.getElementById('adminDesc').value,
        instructor: document.getElementById('adminInstructor').value,
        videoUrl: document.getElementById('adminVideo').value,
        quizQuestion: JSON.stringify(quizzesArray)
    };

    fetch(API_BASE_URL + "/api/courses", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
    })
    .then(response => response.json())
    .then(data => {
        alert("🎉 Course with Multiple Quizzes successfully added!");
        document.getElementById('addCourseForm').reset();
        document.getElementById('quizListContainer').innerHTML = '';
        addQuizQuestionField();
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