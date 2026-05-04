const formatError = (error: Error | string): string => {
  const msg = typeof error === 'string' ? error : (error.message || String(error));

  if (msg.includes('ECONNREFUSED')) return 'Error de conexión: El servidor no responde.';
  if (msg.includes('already registered')) return 'Este email ya está en uso por otro usuario.';
  if (msg.includes('already taken')) return 'Este nombre de usuario ya está ocupado.';
  if (msg.includes('Invalid email format')) return 'Formato de email no válido (falta @ o dominio).';
  if (msg.includes('6 characters')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Authentication failure') || msg.includes('Usuario no encontrado')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Token expired')) return 'Sesión caducada. Por favor, accede de nuevo.';

  return msg;
};

const BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiClientConfig extends RequestInit {
  body?: any;
}

const apiClient = async <T = any>(endpoint: string, { body, ...customConfig }: ApiClientConfig = {}): Promise<T> => {
  const token = localStorage.getItem('lockin_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers as Record<string, string>,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    console.log(`[API Request] Calling ${config.method || 'GET'} ${url}...`);
    const response = await fetch(`${BASE_URL}${url}`, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (parseError) {
      console.warn(`[API] Failed to parse response from ${url}`, parseError);
      data = response.statusText;
    }

    if (!response.ok) {
      console.error(`[API Response Error] ${url} (Status: ${response.status})`, data);
      const errorMessage = (typeof data === 'object' ? data.message || data.error : data) || response.statusText;

      const isRankingCall = url.includes('/api/admin/users');
      if ((response.status === 401 || response.status === 403) && !url.includes('/api/auth') && !isRankingCall) {
        console.warn('[API] Sesión caducada o acceso denegado. Cerrando sesión...');
        localStorage.removeItem('lockin_user');
        localStorage.removeItem('lockin_token');
        window.location.href = '/';
      }

      throw new Error(formatError(errorMessage));
    }

    if (response.status === 204) {
      return null as any;
    }

    return data as T;
  } catch (error) {
    console.error(`[API Network Error] ${endpoint}:`, error);
    throw new Error(formatError(error as Error));
  }
};

export default apiClient;
