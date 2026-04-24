const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
};

export const auth = {
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  getDefaults: () =>
    fetch(`${API_BASE}/auth/defaults`).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),
};

export const datasets = {
  getCategories: () =>
    fetch(`${API_BASE}/datasets/categories`, { headers: getHeaders() }).then(handleResponse),

  getAll: (category) =>
    fetch(`${API_BASE}/datasets${category ? `?category=${category}` : ''}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getOne: (id) =>
    fetch(`${API_BASE}/datasets/${id}`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${API_BASE}/datasets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${API_BASE}/datasets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${API_BASE}/datasets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  generate: (category, prompt, options) =>
    fetch(`${API_BASE}/datasets/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ category, prompt, options }),
    }).then(handleResponse),

  saveGenerated: (data) =>
    fetch(`${API_BASE}/datasets/generate/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getGenerationHistory: (category) =>
    fetch(`${API_BASE}/datasets/generations/history${category ? `?category=${category}` : ''}`, {
      headers: getHeaders(),
    }).then(handleResponse),
};
