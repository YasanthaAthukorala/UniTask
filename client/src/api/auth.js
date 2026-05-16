import { apiRequest, setToken, clearToken } from './client';

export function register(name, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }).then((data) => {
    setToken(data.token);
    return data.user;
  });
}

export function login(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((data) => {
    setToken(data.token);
    return data.user;
  });
}

export function logout() {
  clearToken();
}

export function fetchMe() {
  return apiRequest('/api/auth/me').then((data) => data.user);
}
