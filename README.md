Aquí tienes un archivo **FRONTEND.md** bien estructurado, limpio y profesional, diseñado específicamente para el código que hemos construido. Incluye instrucciones de instalación, capturas (marcadores), arquitectura y los endpoints que estás utilizando.

---

# 📝 FRONTEND.md - Project Management System

Este es el cliente web desarrollado en **Vanilla JavaScript** para interactuar con la API de gestión de proyectos y tareas. El sistema permite la autenticación segura mediante JWT, creación de proyectos y control del ciclo de vida de tareas.

---

## 🚀 Características Principales

* **Autenticación**: Registro e Inicio de Sesión con persistencia de sesión mediante `localStorage`.
* **Gestión de Proyectos**:
* Listado dinámico de proyectos.
* Creación de proyectos (solo nombre).
* Activación de proyectos mediante **PATCH**.


* **Gestión de Tareas**:
* Listado filtrado por ID de proyecto.
* Creación de tareas vinculadas a la ruta del proyecto.
* Marcado de tareas completadas mediante **PATCH**.


* **Interfaz Responsiva**: Diseño minimalista utilizando variables CSS y animaciones suaves.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5**: Estructura semántica.
* **CSS3**: Variables globales, Flexbox, Grid y Modales personalizados.
* **JavaScript (ES6+)**: Fetch API para comunicación asíncrona, Manejo de DOM y Gestión de estado local.

---

## 📂 Estructura del Proyecto

```text
frontend/
├── index.html      # Estructura principal y contenedores de secciones
├── css/
│   └── style.css   # Estilos, variables y diseño de componentes
└── js/
    └── app.js      # Lógica de negocio, peticiones API y manejo de modales

```

---

## ⚙️ Configuración e Instalación

1. **Requisito Previo**: Asegúrate de que el Backend (Spring Boot) esté corriendo en `http://localhost:8080`.
2. **Configuración de API**:
En `js/app.js`, verifica la URL base:
```javascript
const API_BASE = "http://localhost:8080/api";

```


3. **Ejecución**:
Abre `index.html` con un servidor local (ej. **Live Server** de VS Code) para evitar problemas de rutas relativas.

---

## 🔌 Integración con la API

El frontend consume los siguientes endpoints del backend:

### Proyectos

| Método | Endpoint | Descripción |
| --- | --- | --- |
| **GET** | `/projects` | Obtiene todos los proyectos del usuario. |
| **POST** | `/projects` | Crea un nuevo proyecto (`{ name }`). |
| **PATCH** | `/projects/{id}/activate` | Activa un proyecto inactivo. |

### Tareas

| Método | Endpoint | Descripción |
| --- | --- | --- |
| **GET** | `/projects/{projectId}/tasks` | Obtiene tareas de un proyecto específico. |
| **POST** | `/projects/{projectId}/tasks` | Crea una tarea (`{ title }`). |
| **PATCH** | `/tasks/{id}/complete` | Marca una tarea como completada. |

---

## ⚠️ Solución de Problemas (CORS)

Si al realizar peticiones `PATCH` o `POST` recibes un error de **CORS**, asegúrate de que el Backend tenga habilitado el acceso para el puerto de tu frontend (normalmente `5500`):

**En `WebConfig.java`:**

```java
.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")

```

**En `SecurityConfig.java`:**

```java
http.cors(Customizer.withDefaults())

```

---

## 🎨 Capturas de Pantalla (Previsualización)

*Vista de Login y Registro.*

*Dashboard principal con listado de proyectos y estados.*

*Gestión de tareas dentro de un proyecto.*

---

Desarrollado con ❤️ para **Project Management System**.

