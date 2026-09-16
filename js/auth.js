// Authentication and Token Management
const API = 'http://localhost:5000';

function setToken(token) {
    localStorage.setItem('equihire_token', token);
}

function getToken() {
    return localStorage.getItem('equihire_token');
}

function removeToken() {
    localStorage.removeItem('equihire_token');
}

function getUser() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (e) {
        return null;
    }
}

function checkAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function checkRole(requiredRole) {
    const user = getUser();
    if (!user || (user.role !== requiredRole && user.role !== 'admin')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    removeToken();
    window.location.href = 'login.html';
}

async function login(email, password) {
    const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
        throw new Error('Invalid credentials');
    }
    
    const data = await response.json();
    setToken(data.token);
    return data;
}

async function register(name, email, password) {
    const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'candidate' })
    });
    
    if (!response.ok) {
        throw new Error('Registration failed');
    }
    
    const data = await response.json();
    setToken(data.token);
    return data;
}
