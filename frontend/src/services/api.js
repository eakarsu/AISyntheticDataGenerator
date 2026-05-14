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
    if (response.status === 503) {
      const err = new Error(data.error || 'AI service unavailable: API key not configured on the server.');
      err.status = 503;
      throw err;
    }
    const err = new Error(data.error || `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
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

  export: (id, format = 'json') =>
    fetch(`${API_BASE}/datasets/${id}/export?format=${format}`, {
      headers: getHeaders(),
    }),

  validateDataset: (datasetId, category) =>
    fetch(`${API_BASE}/datasets/generate/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ datasetId, category }),
    }).then(handleResponse),

  generateFromSchema: (data) =>
    fetch(`${API_BASE}/datasets/generate-from-schema`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getPrivacyScore: (id) =>
    fetch(`${API_BASE}/datasets/${id}/privacy-score`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),

  schemaInfer: (data) =>
    fetch(`${API_BASE}/datasets/schema-infer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  redactPII: (data) =>
    fetch(`${API_BASE}/datasets/redact-pii`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  distributionPreserve: (data) =>
    fetch(`${API_BASE}/datasets/distribution-preserve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  edgeCases: (data) =>
    fetch(`${API_BASE}/datasets/edge-cases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};
