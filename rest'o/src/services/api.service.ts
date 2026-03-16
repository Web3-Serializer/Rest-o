const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const authAPI = {
  
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  updateProfile: (data: any) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getProfile: () => request('/auth/profile'),
};

export const menuAPI = {
  getAll: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return request(`/menus?${params}`);
  },
  
  getById: (id: string) => request(`/menus/${id}`),

  create: (data: any) =>
    request('/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/menus/${id}`, {
      method: 'DELETE',
    }),
};

export const orderAPI = {
  getAll: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return request(`/orders?${params}`);
  },
  getMyOrders: () => request('/orders/myOrders'),

  getById: (id: string) => request(`/orders/${id}`),

  create: (data: any) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request(`/orders/${id}`, {
      method: 'DELETE',
    }),
};

export const reservationAPI = {
  getAll: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return request(`/reservations?${params}`);
  },

  getMyReservations: () => request('/reservations/myReservations'),

  getById: (id: string) => request(`/reservations/${id}`),

  create: (data: any) =>
    request('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/reservations/${id}`, {
      method: 'DELETE',
    }),
};

export const statsAPI = {
  getAll: () => request('/stats'),
};

export const restaurantAPI = {
  getRestaurantStatus: () => request('/restaurant/status'),
  getRestaurantSettings: () => request('/restaurant/settings'),
  updateRestaurantSettings: (data: any) => 
    request('/restaurant/settings', { method: 'PUT', body: JSON.stringify(data) })
}

export const adminAPI = {
  getUsers: (params?: any) => {
    const queryParams = new URLSearchParams(params);
    return request(`/admin/users?${queryParams}`);
  },
  getUserById: (id: string) => request(`/admin/users/${id}`),
  createUser: (data: any) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getStats: () => request('/admin/stats'),
};