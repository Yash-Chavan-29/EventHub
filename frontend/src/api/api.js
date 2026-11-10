const API_BASE_URL = '/api'; // Handled elegantly by Vite dev proxy

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('event_hub_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || `API error with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Request Error on ${endpoint}:`, error.message);
    throw error;
  }
};

const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
