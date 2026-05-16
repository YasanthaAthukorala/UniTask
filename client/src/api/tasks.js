import { apiRequest } from './client';

export function fetchTasks({ search = '', category = 'All', sort = 'newest' } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (category && category !== 'All') params.set('category', category);
  if (sort) params.set('sort', sort);

  const qs = params.toString();
  return apiRequest(`/api/tasks${qs ? `?${qs}` : ''}`);
}

export function createTask(task) {
  return apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export function updateTask(id, task) {
  return apiRequest(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  });
}

export function deleteTask(id) {
  return apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
}

export function hireTask(id) {
  return apiRequest(`/api/tasks/${id}/hire`, { method: 'POST' });
}

export function rateTask(id, { stars, comment }) {
  return apiRequest(`/api/tasks/${id}/rate`, {
    method: 'POST',
    body: JSON.stringify({ stars, comment }),
  });
}
