const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'auth_token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || 'No se pudo completar la solicitud');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function login(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

export async function register(username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export function getCurrentUser() {
  return request('/auth/me');
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function getSolicitudes() {
  return request('/solicitudes');
}

export function createSolicitud(solicitud) {
  return request('/solicitudes', {
    method: 'POST',
    body: JSON.stringify(solicitud),
  });
}

export function updateSolicitud(id, solicitud) {
  return request(`/solicitudes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(solicitud),
  });
}

export function deleteSolicitud(id) {
  return request(`/solicitudes/${id}`, {
    method: 'DELETE',
  });
}

export function getUsers() {
  return request('/users');
}

export function createUserByAdmin(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUserStatus(id, activo) {
  return request(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
}

export function getSessions() {
  return request('/sessions');
}
