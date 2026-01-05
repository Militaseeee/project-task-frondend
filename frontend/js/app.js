const API_BASE = "http://localhost:8080/api/v1";

// --- UTILIDADES ---
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function showSection(section) {
    document.getElementById('login-section').classList.toggle('hidden', section !== 'login');
    document.getElementById('register-section').classList.toggle('hidden', section !== 'register');
}

// --- LÓGICA DE AUTENTICACIÓN ---
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (res.ok) {
            showToast("Account created! Please login.", "success");
            showSection('login');
        } else {
            showToast("Error creating account", "danger");
        }
    } catch (err) {
        showToast("Server unreachable", "danger");
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            initDashboard();
        } else {
            showToast("Invalid credentials", "danger");
        }
    } catch (err) {
        showToast("Login failed", "danger");
    }
});

// --- LÓGICA DEL DASHBOARD ---
function initDashboard() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('display-username').innerText = localStorage.getItem('username');
    loadProjects();
}

async function loadProjects() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projects = await res.json();
        
        const list = document.getElementById('project-list');
        list.innerHTML = "";

        if (projects.length === 0) {
            list.innerHTML = '<p class="empty-msg">No projects available.</p>';
            return;
        }

        projects.forEach(p => {
            list.innerHTML += `
                <div class="project-card">
                    <h4>${p.name}</h4>
                    <p>${p.description || 'No description'}</p>
                    <small>Status: ${p.status}</small>
                </div>
            `;
        });
    } catch (err) {
        showToast("Error loading projects", "danger");
    }
}

document.getElementById('logout-btn').onclick = () => {
    localStorage.clear();
    location.reload();
};

// Verificar sesión al cargar
if (localStorage.getItem('token')) initDashboard();