import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE });

export function unwrapResponse(response) {
  const payload = response && response.data !== undefined ? response.data : response;
  if (payload && payload.success === false) {
    throw new Error(payload.error || 'Server error');
  }
  if (payload && payload.success === true && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
}

export function getErrorMessage(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Server error'
  );
}

export async function apiGet(path) {
  return unwrapResponse(await client.get(path));
}

export async function apiPost(path, data) {
  return unwrapResponse(await client.post(path, data));
}

export async function apiPut(path, data) {
  return unwrapResponse(await client.put(path, data));
}

export async function apiPatch(path, data) {
  return unwrapResponse(await client.patch(path, data));
}

export async function apiDelete(path, data) {
  return unwrapResponse(await client.delete(path, { data }));
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function text(value) {
  return value === undefined || value === null ? '' : String(value);
}

export function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function currentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}') || {};
  } catch {
    return {};
  }
}
