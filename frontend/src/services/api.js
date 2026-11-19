const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

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

// ── Packages ─────────────────────────────────────────────
export const packagesAPI = {
  getByGuide: (guideId) => request(`/packages/guide/${guideId}`),
  getMy: () => request('/packages/my'),
  create: (body) => request('/packages', { method: 'POST', body: JSON.stringify(body) }),
  createBatch: (packages) => request('/packages/batch', { method: 'POST', body: JSON.stringify({ packages }) }),
  update: (id, body) => request(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/packages/${id}`, { method: 'DELETE' }),
};

// ── Availability ─────────────────────────────────────────
export const availabilityAPI = {
  getByGuide: (guideId) => request(`/availability/guide/${guideId}`),
  check: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/availability/check?${query}`);
  },
  getSlots: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/availability/slots?${query}`);
  },
  updateMy: (body) => request('/availability/my', { method: 'PUT', body: JSON.stringify(body) }),
  getMyBookings: () => request('/availability/my/bookings'),
};

// ── Bookings ─────────────────────────────────────────────
export const bookingsAPI = {
  getQuote: (body) => request('/bookings/quote', { method: 'POST', body: JSON.stringify(body) }),
  create: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/my'),
  getGuideBookings: () => request('/bookings/guide'),
  getById: (id) => request(`/bookings/${id}`),
  accept: (id) => request(`/bookings/${id}/accept`, { method: 'PUT' }),
  decline: (id, reason) => request(`/bookings/${id}/decline`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  confirm: (id, paymentMethod) => request(`/bookings/${id}/confirm`, { method: 'PUT', body: JSON.stringify({ payment_method: paymentMethod }) }),
  cancel: (id, reason) => request(`/bookings/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  complete: (id) => request(`/bookings/${id}/complete`, { method: 'PUT' }),
  // Legacy endpoint for backward compatibility
  updateStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ── Ledger ───────────────────────────────────────────────
export const ledgerAPI = {
  getMyEarnings: () => request('/ledger/guide/me'),
  getByGuide: (guideId) => request(`/ledger/guide/${guideId}`),
  getByBooking: (bookingId) => request(`/ledger/booking/${bookingId}`),
  approvePayout: (id, notes) => request(`/ledger/${id}/approve-payout`, { method: 'PUT', body: JSON.stringify({ notes }) }),
};

// ── Verifications ────────────────────────────────────────
export const verificationsAPI = {
  submit: (documents) => request('/verifications/submit', { method: 'POST', body: JSON.stringify({ documents }) }),
  getMy: () => request('/verifications/my'),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/verifications${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/verifications/${id}`),
  approve: (id, notes) => request(`/verifications/${id}/approve`, { method: 'PUT', body: JSON.stringify({ notes }) }),
  reject: (id, reason) => request(`/verifications/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  requestInfo: (id, reason) => request(`/verifications/${id}/request-info`, { method: 'PUT', body: JSON.stringify({ reason }) }),
};

// ── Reviews ──────────────────────────────────────────────
export const reviewsAPI = {
  create: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  getByGuide: (guideId) => request(`/reviews/guide/${guideId}`),
  getByDestination: (destId) => request(`/reviews/destination/${destId}`),
};
export const itinerariesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/itineraries${query ? `?${query}` : ''}`);
  },
  getMy: () => request('/itineraries/my'),
  getPurchased: () => request('/itineraries/purchased'),
  getById: (id) => request(`/itineraries/${id}`),
  create: (body) => request('/itineraries', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/itineraries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  publish: (id) => request(`/itineraries/${id}/publish`, { method: 'PUT' }),
  delete: (id) => request(`/itineraries/${id}`, { method: 'DELETE' }),
  purchase: (id) => request(`/itineraries/${id}/purchase`, { method: 'POST' }),
  review: (id, body) => request(`/itineraries/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
  getReviews: (id) => request(`/itineraries/${id}/reviews`),
};
