const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'No se pudo completar la solicitud');
  }

  return data;
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
