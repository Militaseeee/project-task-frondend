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
    const userVal = document.getElementById('login-user').value;
    const passVal = document.getElementById('login-pass').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: userVal, // REVISA: Si falla con 400, cambia 'username' por 'email'
                password: passVal 
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Error del servidor:", errorData);
            showToast(errorData.message || "Credenciales incorrectas", "danger");
            return;
        }

        const data = await res.json();
        // Detección automática del nombre del campo del token
        const token = data.token || data.accessToken || data.jwt;

        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('username', userVal);
            showToast("¡Bienvenido!", "success");
            initDashboard();
        } else {
            console.error("Respuesta sin token:", data);
            showToast("Error: El servidor no envió un token válido", "danger");
        }
    } catch (err) {
        showToast("Error de conexión", "danger");
    }
});

// --- REGISTRO ---
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        username: document.getElementById('reg-user').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-pass').value
    };

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast("Cuenta creada exitosamente", "success");
            showSection('login');
        } else {
            showToast("Error al registrar", "danger");
        }
    } catch (err) { showToast("Error de red", "danger"); }
});

// --- DASHBOARD ---
function initDashboard() {
    // Estas líneas son las que hacen la "redirección" visual
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('display-username').innerText = localStorage.getItem('username');
    loadProjects();
}

async function loadProjects() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("No hay token disponible");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`
                // Quitamos 'Content-Type' y 'Accept' en el GET para intentar evitar validaciones extra del navegador
            }
        });

        // Si la respuesta no es 200 OK, lanzamos error para ver el status en consola
        if (!res.ok) {
            console.error("Error del servidor. Status:", res.status);
            if(res.status === 403 || res.status === 401) {
                showToast("Sesión expirada o sin permisos", "danger");
            }
            return;
        }

        const projects = await res.json();
        const list = document.getElementById('project-list');
        list.innerHTML = "";

        if (projects.length === 0) {
            list.innerHTML = '<p class="empty-msg">No hay proyectos disponibles aún.</p>';
            return;
        }

        projects.forEach(p => {
            // Recordamos: NO usamos p.description porque no existe en tu Back
            list.innerHTML += `
                <div class="project-card">
                    <h4>${p.name}</h4>
                    <p>Estado: ${p.status}</p>
                    <button class="btn-outline" style="margin-top:10px" onclick="viewTasks('${p.id}', '${p.name}')">
                        📂 Ver Tareas
                    </button>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error crítico en fetch Proyectos:", err);
        showToast("Error de conexión (CORS)", "danger");
    }
}

// --- PROYECTOS Y TAREAS ---
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const nameValue = document.getElementById('proj-name').value;

    try {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name: nameValue // TU BACK SOLO RECIBE ESTO
            })
        });

        if (res.ok) {
            showToast("Proyecto creado con éxito", "success");
            closeModal('project-modal');
            loadProjects();
            e.target.reset();
        } else {
            const errorData = await res.json();
            console.error("Error del servidor al crear:", errorData);
            showToast("Error al crear: " + (errorData.message || ""), "danger");
        }
    } catch (err) {
        console.error("Fallo al crear proyecto (CORS o Red):", err);
        showToast("Error de conexión. Revisa el CORS en el servidor.", "danger");
    }
});

async function viewTasks(projectId, projectName) {
    document.getElementById('current-project-id').value = projectId;
    document.getElementById('task-modal-title').innerText = `Tareas: ${projectName}`;
    openModal('task-modal');
    
    const token = localStorage.getItem('token');
    try {
        // Asumiendo que el GET de tareas es /api/projects/{id}/tasks
        const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const tasks = await res.json();
        const list = document.getElementById('task-list');
        list.innerHTML = "";

        if (Array.isArray(tasks)) {
            if (tasks.length === 0) {
                list.innerHTML = "<p>No hay tareas aún.</p>";
            } else {
                tasks.forEach(t => {
                    const completeBtn = !t.completed ? 
                        `<button class="btn-success" style="width:auto; padding:2px 8px; font-size:12px;" 
                            onclick="completeTask('${t.id}', '${projectId}', '${projectName}')">
                            Completar
                         </button>` : 
                        `<span style="color:green; font-weight:bold;">✅ Hecha</span>`;

                    list.innerHTML += `
                        <div class="task-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                            <span>${t.title}</span>
                            ${completeBtn}
                        </div>
                    `;
                });
            
            }
        }
    } catch (e) { console.error("Error cargando tareas:", e); }
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const projectId = document.getElementById('current-project-id').value;
    const title = document.getElementById('task-title').value;

    try {
        // La URL ahora incluye el projectId en la ruta: /api/projects/{id}/tasks
        const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: title }) // Solo enviamos el título
        });

        if (res.ok) {
            // Refrescar la lista de tareas
            const projectName = document.getElementById('task-modal-title').innerText.replace('Tareas: ', '');
            viewTasks(projectId, projectName);
            e.target.reset();
            showToast("Tarea añadida", "success");
        } else {
            const errData = await res.json();
            console.error("Error al crear tarea:", errData);
            showToast("Error al crear tarea", "danger");
        }
    } catch (err) {
        console.error("Fallo en la petición de tarea:", err);
    }
});


// --- COMPLETAR TAREA (PATCH /api/tasks/{id}/complete) ---
async function completeTask(taskId, projectId, projectName) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
            method: 'PATCH', // MÉTODO PATCH
            headers: { 
                'Authorization': `Bearer ${token}`
                // Nota: No envíes Content-Type si no envías un body JSON, 
                // esto a veces ayuda a evitar problemas de Preflight.
            }
        });

        if (res.ok) {
            showToast("Tarea completada ✅", "success");
            viewTasks(projectId, projectName);
        } else {
            console.error("Error al completar:", res.status);
        }
    } catch (err) {
        console.error("Error en completeTask:", err);
    }
}


async function activateProject(projectId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/projects/${projectId}/activate`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast("Proyecto Activado 🚀", "success");
            loadProjects(); // Recarga las tarjetas del dashboard
        }
    } catch (err) { console.error(err); }
}


// --- GESTIÓN DE MODALES ---
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.getElementById('btn-new-project').onclick = () => openModal('project-modal');
document.getElementById('logout-btn').onclick = () => { localStorage.clear(); location.reload(); };

// Verificar sesión al cargar
if (localStorage.getItem('token')) initDashboard();