// API configuration and utilities
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : 'http://127.0.0.1:3000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  dbName: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(dbName ? { 'x-banco': dbName } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Auth utilities
export function setAuth(dbName: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dbName', dbName);
  }
}

export function getAuth(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dbName');
  }
  return null;
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dbName');
  }
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}
