const API_URL = "http://localhost:8080/api";

const api = {
    // Guardar el token en el navegador
    setToken: (token) => localStorage.setItem("jwt_token", token),
    getToken: () => localStorage.getItem("jwt_token"),
    logout: () => localStorage.removeItem("jwt_token"),

    // Petición genérica con seguridad
    async request(endpoint, method = "GET", body = null) {
        const headers = {
            "Content-Type": "application/json",
        };

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            this.logout();
            location.reload();
        }
        
        return response.json();
    }
};