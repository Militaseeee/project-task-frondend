const API_BASE = "http://localhost:8080/api"; 

// --- UTILIDADES ---
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function showSection(section) {
    document.getElementById('login-section').classList.toggle('hidden', section !== 'login');
    document.getElementById('register-section').classList.toggle('hidden', section !== 'register');
}

// --- LOGICA DE ACCESO (LOGIN) ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-user').value;
    const passwordInput = document.getElementById('login-pass').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: usernameInput, // REVISA: Si en Java tu DTO usa "email", cambia esto a email: usernameInput
                password: passwordInput 
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("DETALLE ERROR 400:", errorData);
            showToast(errorData.message || "Credenciales incorrectas", "danger");
            return;
        }

        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', usernameInput);
            showToast("¡Bienvenido!", "success");
            initDashboard();
        }
    } catch (err) {
        showToast("Error de conexión con el servidor", "danger");
    }
});

// --- REGISTRO ---
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
            showToast("Cuenta creada. Ya puedes entrar.", "success");
            showSection('login');
        } else {
            showToast("Error al registrar usuario", "danger");
        }
    } catch (err) {
        showToast("Error de servidor", "danger");
    }
});

// --- DASHBOARD ---
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
            list.innerHTML = '<p class="empty-msg">No hay proyectos aún.</p>';
            return;
        }

        projects.forEach(p => {
            list.innerHTML += `
                <div class="project-card">
                    <h4>${p.name}</h4>
                    <p>${p.description || 'Sin descripción'}</p>
                    <small>Estado: ${p.status}</small>
                    <button class="btn-outline" style="margin-top:10px" onclick="viewTasks(${p.id}, '${p.name}')">
                        📂 Ver Tareas
                    </button>
                </div>
            `;
        });
    } catch (err) {
        showToast("Error al cargar proyectos", "danger");
    }
}

// --- CREAR PROYECTO ---
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('proj-name').value;
    const description = document.getElementById('proj-desc').value;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, status: 'ACTIVE' })
        });

        if (res.ok) {
            showToast("Proyecto guardado", "success");
            closeModal('project-modal');
            loadProjects();
            e.target.reset();
        }
    } catch (err) {
        showToast("Error al crear proyecto", "danger");
    }
});

// --- TAREAS ---
async function viewTasks(projectId, projectName) {
    document.getElementById('current-project-id').value = projectId;
    document.getElementById('task-modal-title').innerText = `Tareas de: ${projectName}`;
    openModal('task-modal');
    
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/tasks?projectId=${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await res.json();
        const list = document.getElementById('task-list');
        list.innerHTML = tasks.length ? "" : "<p>No hay tareas.</p>";
        
        tasks.forEach(t => {
            list.innerHTML += `
                <div class="task-item">
                    <span>${t.title}</span>
                    <span class="badge">${t.status || 'PENDIENTE'}</span>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectId = document.getElementById('current-project-id').value;
    const title = document.getElementById('task-title').value;
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, title })
    });

    if (res.ok) {
        const name = document.getElementById('task-modal-title').innerText.replace('Tareas de: ', '');
        viewTasks(projectId, name);
        e.target.reset();
    }
});

// --- GESTIÓN DE MODALES ---
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.getElementById('btn-new-project').onclick = () => openModal('project-modal');

document.getElementById('logout-btn').onclick = () => {
    localStorage.clear();
    location.reload();
};

// Verificar sesión al cargar
if (localStorage.getItem('token')) initDashboard();