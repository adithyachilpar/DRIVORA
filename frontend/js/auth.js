// Authentication functions

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    return !!getToken();
}

// API calls with authentication
async function authenticatedCall(endpoint, method = 'GET', data = null) {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';  // FIXED: removed slash
        return { success: false, error: 'Not authenticated' };
    }

    const url = `http://localhost:8000${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (response.status === 401) {
            removeToken();
            window.location.href = 'login.html';  // FIXED: removed slash
            return { success: false, error: 'Session expired' };
        }
        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Register function
async function register(name, phone, email, password) {
    const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
        setToken(data.access_token);
        setUser({ id: data.user_id, name: data.name });
        window.location.href = 'index.html';  // FIXED: removed slash
        return { success: true, data };
    } else {
        return { success: false, error: data.detail || 'Registration failed' };
    }
}

// Login function
async function login(phone, password) {
    const formData = new FormData();
    formData.append('username', phone);
    formData.append('password', password);

    const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
        setToken(data.access_token);
        setUser({ id: data.user_id, name: data.name });
        window.location.href = 'index.html';  // FIXED: removed slash
        return { success: true, data };
    } else {
        return { success: false, error: data.detail || 'Login failed' };
    }
}

// Logout function
function logout() {
    removeToken();
    window.location.href = 'login.html';  // FIXED: removed slash
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', () => {
    const publicPages = ['login.html', 'register.html'];  // FIXED: removed slashes
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage) && !isLoggedIn()) {
        window.location.href = 'login.html';  // FIXED: removed slash
    }
});