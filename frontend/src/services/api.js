const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// ── Helper: make API request ────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (credential, role) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential, ...(role && { role }) }) }),
  getMe: () => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
};

// ── Destinations ─────────────────────────────────────────
export const destinationsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/destinations${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/destinations/${id}`),
};

// ── Guides ───────────────────────────────────────────────
export const guidesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/guides${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/guides/${id}`),
  onboard: (body) => request('/guides/onboard', { method: 'POST', body: JSON.stringify(body) }),
  getDashboard: () => request('/guides/dashboard/stats'),
  updateProfile: (body) => request('/guides/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// ── Bookings ─────────────────────────────────────────────
export const bookingsAPI = {
  create: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/my'),
  getGuideBookings: () => request('/bookings/guide'),
  updateStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
};

// ── Reviews ──────────────────────────────────────────────
export const reviewsAPI = {
  create: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  getByGuide: (guideId) => request(`/reviews/guide/${guideId}`),
  getByDestination: (destId) => request(`/reviews/destination/${destId}`),
};
